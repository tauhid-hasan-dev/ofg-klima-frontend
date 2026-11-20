import { brands as sourceBrands } from "@/lib/data/brands";
import { categories as sourceCategories } from "@/lib/data/categories";
import { logoFor } from "@/lib/data/media";
import { categoryImage, products as sourceProducts, slugify } from "@/lib/data/products";
import { usdToTry } from "@/lib/currency";
import { applyMarkup } from "@/lib/pricing";
import {
  DEFAULT_SORT,
  type Brand,
  type Category,
  type FacetValue,
  type Product,
  type ProductListResult,
  type ProductQuery,
} from "@/lib/types";

/**
 * The data access layer.
 *
 * Every function here is `async` even though the fixtures are synchronous. That
 * is intentional: when the real API arrives, each body is swapped for a `fetch`
 * and no caller has to change. Nothing outside this file imports from
 * `src/lib/data` — keep it that way.
 */

export const DEFAULT_PER_PAGE = 24;

/**
 * The catalogue as the storefront sees it: trade prices from the source,
 * uplifted by their category's retail markup (requirement 9).
 *
 * Applied here, once, rather than at each render. Doing it at the boundary is
 * what makes requirement 15 fall out for free — a product imported from DIA
 * tomorrow carries a grup kodu, so it picks up the right markup with nobody
 * touching it — and it keeps sorting, the price facet and the cart all working
 * off the same number the shopper is reading.
 */
const products = sourceProducts.map(applyMarkup);

/**
 * The category tree as the storefront sees it: each node carrying the lead
 * photograph for its part family.
 *
 * Resolved here rather than written into `src/lib/data/categories.ts` so that
 * file stays a description of the client's taxonomy — slugs, DIA group codes,
 * markups — and does not have to be re-edited every time the photography
 * changes. A family with no photos keeps the generated render named in the
 * fixture, so every category still draws something.
 */
const categories = sourceCategories.map((category) => ({
  ...category,
  image: categoryImage(category.slug, category.image),
}));

/**
 * Brands as the storefront sees them, each carrying its wordmark where one has
 * been supplied under public/brands/.
 *
 * Resolved here for the same reason as the category images: the fixture
 * describes the client's brand list, and which logo files happen to exist is
 * not part of that description.
 */
const brands = sourceBrands.map((brand) => {
  const logo = logoFor(brand.slug);
  return logo ? { ...brand, logo } : brand;
});

/* ── Categories ─────────────────────────────────────────────────────────── */

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getTopLevelCategories(): Promise<Category[]> {
  return categories.filter((category) => !category.parent);
}

export async function getMainNavCategories(): Promise<Category[]> {
  return categories.filter((category) => category.inMainNav);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return categories.find((category) => category.slug === slug);
}

export async function getChildCategories(parentSlug: string): Promise<Category[]> {
  return categories.filter((category) => category.parent === parentSlug);
}

/**
 * The listing sidebar's "Ürün Grupları" rail: every top-level group plus the
 * sub-headings each one expands to (requirement 8).
 *
 * One call so every listing page shows the same rail — a sidebar whose
 * contents depend on which page you came from is a navigation aid that needs
 * its own navigation aid.
 */
export async function getCategoryRail(): Promise<{
  tops: Category[];
  childrenBySlug: Record<string, Category[]>;
}> {
  const tops = categories.filter((category) => !category.parent);
  const childrenBySlug: Record<string, Category[]> = {};

  for (const top of tops) {
    const children = categories.filter((category) => category.parent === top.slug);
    if (children.length > 0) childrenBySlug[top.slug] = children;
  }

  return { tops, childrenBySlug };
}

/** The category itself plus all of its descendants — used when filtering. */
function categoryBranch(slug: string): string[] {
  const children = categories.filter((category) => category.parent === slug).map((c) => c.slug);
  return [slug, ...children];
}

export async function getCategoryTrail(slug: string): Promise<Category[]> {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return [];
  const parent = category.parent ? categories.find((c) => c.slug === category.parent) : undefined;
  return parent ? [parent, category] : [category];
}

/* ── Brands ─────────────────────────────────────────────────────────────── */

export async function getBrands(): Promise<Brand[]> {
  return brands;
}

export async function getBrand(slug: string): Promise<Brand | undefined> {
  return brands.find((brand) => brand.slug === slug);
}

export async function getBrandsWithCounts(): Promise<Array<Brand & { productCount: number }>> {
  return brands.map((brand) => ({
    ...brand,
    productCount: products.filter((product) => product.brandSlug === brand.slug).length,
  }));
}

/* ── Products ───────────────────────────────────────────────────────────── */

export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((product) => product.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return products.find((product) => product.id === id);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const index = new Map(products.map((product) => [product.id, product]));
  return ids.map((id) => index.get(id)).filter((product): product is Product => Boolean(product));
}

export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const sameCategory = products.filter(
    (candidate) => candidate.id !== product.id && candidate.categorySlug === product.categorySlug,
  );
  const sameBrand = products.filter(
    (candidate) =>
      candidate.id !== product.id &&
      candidate.brandSlug === product.brandSlug &&
      candidate.categorySlug !== product.categorySlug,
  );
  return [...sameCategory, ...sameBrand].slice(0, limit);
}

export async function getFeaturedProducts(categorySlug: string, limit = 10): Promise<Product[]> {
  const branch = categoryBranch(categorySlug);
  return products
    .filter((product) => branch.includes(product.categorySlug))
    .sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller) || (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}

export async function getNewestProducts(limit = 10): Promise<Product[]> {
  return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

/* ── Search + listing ───────────────────────────────────────────────────── */

/**
 * Matches against name, OEM code, SKU, brand and fitment lines. Codes are
 * normalised (punctuation stripped) so "SD5S14 6634", "sd5s14-6634" and
 * "SD5S146634" all find the same part — that is how people actually type part
 * numbers.
 */
function matchesSearch(product: Product, term: string): boolean {
  const normalised = term.trim().toLowerCase();
  if (!normalised) return true;

  const codeTerm = normalised.replace(/[^a-z0-9]/g, "");
  const codeHaystack = `${product.oem}${product.sku}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (codeTerm.length >= 3 && codeHaystack.includes(codeTerm)) return true;

  const haystack = [product.name, product.oem, product.sku, product.brandSlug, ...product.vehicles]
    .join(" ")
    .toLowerCase();

  // Every whitespace-separated token must appear somewhere — AND, not OR, which
  // keeps multi-word searches like "renault kompresör" useful.
  return normalised.split(/\s+/).every((token) => haystack.includes(token));
}

/** Display price in TRY, derived from the stored USD figure. */
function priceFor(product: Product): number {
  return usdToTry(product.priceUsd);
}

function countBy(list: Product[], key: (product: Product) => string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const product of list) {
    for (const value of key(product)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

export async function listProducts(query: ProductQuery = {}): Promise<ProductListResult> {
  const {
    brand = [],
    category,
    vehicle = [],
    search = "",
    inStockOnly = false,
    bestSellersOnly = false,
    minPrice,
    maxPrice,
    stockCode,
    sort = DEFAULT_SORT,
    page = 1,
    perPage = DEFAULT_PER_PAGE,
  } = query;

  const branch = category ? categoryBranch(category) : null;

  // Base scope: what the page is "about" (its category and/or search term),
  // before any of the user's own facet selections.
  const scope = products.filter((product) => {
    if (branch && !branch.includes(product.categorySlug)) return false;
    if (search && !matchesSearch(product, search)) return false;
    // Part of the scope, not a facet: on /cok-satanlar it is what the page is,
    // so the brand and vehicle counts must be computed within it.
    if (bestSellersOnly && !product.isBestSeller) return false;
    return true;
  });

  /**
   * Standard faceted-search behaviour: each facet's counts are computed with
   * every *other* facet applied but its own selection ignored. Picking "Sanden"
   * must not make the remaining brands vanish, yet it must still narrow the
   * category and vehicle counts.
   */
  function applyFacets(
    list: Product[],
    skip: { brand?: boolean; vehicle?: boolean; price?: boolean } = {},
  ): Product[] {
    return list.filter((product) => {
      if (!skip.brand && brand.length > 0 && !brand.includes(product.brandSlug)) return false;
      if (
        !skip.vehicle &&
        vehicle.length > 0 &&
        !vehicle.some((v) => product.vehicles.some((line) => slugify(line).startsWith(v)))
      ) {
        return false;
      }
      if (inStockOnly && product.stock !== "in_stock" && product.stock !== "low_stock") return false;
      if (stockCode) {
        // "Stok Kodu" is an exact-ish lookup, so match the code fields only —
        // not the product name. Punctuation is ignored both sides.
        const needle = stockCode.toLowerCase().replace(/[^a-z0-9]/g, "");
        const haystack = `${product.sku}${product.oem}${product.barcode ?? ""}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        if (needle && !haystack.includes(needle)) return false;
      }
      if (!skip.price) {
        // Bounds arrive in TRY (what the shopper typed); compare in TRY.
        const priceTry = usdToTry(product.priceUsd);
        if (typeof minPrice === "number" && priceTry < minPrice) return false;
        if (typeof maxPrice === "number" && priceTry > maxPrice) return false;
      }
      return true;
    });
  }

  const filtered = applyFacets(scope);
  const sorted = sortProducts(filtered, sort);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const items = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  const brandCounts = countBy(applyFacets(scope, { brand: true }), (product) => [product.brandSlug]);
  const vehicleCounts = countBy(applyFacets(scope, { vehicle: true }), (product) =>
    // Index on the make only (first token) — "RENAULT MEGANE IV 1.5 dCi" → renault.
    Array.from(new Set(product.vehicles.map((line) => slugify(line.split(" ")[0] ?? "")))).filter(Boolean),
  );
  // Categories drive sidebar navigation, so they reflect the full selection —
  // including the brand pinned by a /marka/[slug] page.
  const categoryCounts = countBy(filtered, (product) => [product.categorySlug]);

  // The slider bounds must not collapse to the range the user just typed in.
  const prices = applyFacets(scope, { price: true }).map(priceFor);

  return {
    items,
    total,
    page: safePage,
    perPage,
    pageCount,
    facets: {
      brands: toFacets(brandCounts, (slug) => brands.find((b) => b.slug === slug)?.name ?? slug),
      categories: toFacets(categoryCounts, (slug) => categories.find((c) => c.slug === slug)?.name ?? slug),
      vehicles: toFacets(vehicleCounts, (slug) => brands.find((b) => b.slug === slug)?.name ?? titleCase(slug)),
    },
    priceRange: {
      min: prices.length ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length ? Math.ceil(Math.max(...prices)) : 0,
    },
  };
}

function sortProducts(list: Product[], sort: ProductQuery["sort"]): Product[] {
  const sorted = [...list];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.priceUsd - b.priceUsd);
    case "price-desc":
      return sorted.sort((a, b) => b.priceUsd - a.priceUsd);
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    case "discount":
      return sorted.sort((a, b) => discountRatio(b) - discountRatio(a));
    default:
      // "Recommended": in-stock best sellers first, then rating, then a stable
      // id tiebreak so the order never flickers between renders.
      return sorted.sort(
        (a, b) =>
          Number(b.stock === "in_stock") - Number(a.stock === "in_stock") ||
          Number(b.isBestSeller) - Number(a.isBestSeller) ||
          (b.rating ?? 0) - (a.rating ?? 0) ||
          a.id.localeCompare(b.id),
      );
  }
}

function discountRatio(product: Product): number {
  if (!product.listPriceUsd || product.listPriceUsd <= product.priceUsd) return 0;
  return (product.listPriceUsd - product.priceUsd) / product.listPriceUsd;
}

function toFacets(counts: Map<string, number>, label: (slug: string) => string): FacetValue[] {
  return Array.from(counts.entries())
    .map(([slug, count]) => ({ slug, label: label(slug), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"));
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toLocaleUpperCase("tr") + part.slice(1))
    .join(" ");
}

/** Lightweight suggestions for the header search dropdown. */
export async function suggestProducts(term: string, limit = 6): Promise<Product[]> {
  if (term.trim().length < 2) return [];
  return products.filter((product) => matchesSearch(product, term)).slice(0, limit);
}

/** Slugs for `generateStaticParams`. */
export async function getAllProductSlugs(): Promise<string[]> {
  return products.map((product) => product.slug);
}

export async function getAllBrandSlugs(): Promise<string[]> {
  return brands.map((brand) => brand.slug);
}

export async function getAllCategorySlugs(): Promise<string[]> {
  return categories.map((category) => category.slug);
}
