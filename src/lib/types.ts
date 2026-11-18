/**
 * Domain model for the OFG storefront.
 *
 * These types are the contract between the UI and the data source. Today the
 * source is the static fixtures in `src/lib/data`; when the backend lands,
 * only `src/lib/repository.ts` has to change — nothing in `src/app` or
 * `src/components` reads fixtures directly.
 */

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "on_order";

/** Part manufacturer (Sanden, Denso…) vs. vehicle make (Renault, Ford…). */
export type BrandKind = "manufacturer" | "vehicle";

export interface Category {
  slug: string;
  name: string;
  /** Slug of the parent category; absent for top-level categories. */
  parent?: string;
  description?: string;
  /** Path under /public, e.g. "/parts/kompresor.svg". */
  image: string;
  /** Shown in the header mega menu. */
  inMainNav?: boolean;
}

export interface Brand {
  slug: string;
  name: string;
  kind: BrandKind;
  country?: string;
  /** Short marketing copy rendered above the brand's product grid. */
  description?: string;
  /** Headline used as the <h1> on /marka/[slug]. */
  headline?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandSlug: string;
  categorySlug: string;
  /** Primary OEM / cross-reference code. Rendered in a mono face. */
  oem: string;
  /** "Stok Kodu" on the client's site, e.g. OFG-21025-ORJ. */
  sku: string;
  /** EAN/barcode. Frequently blank in their ERP, hence optional. */
  barcode?: string;

  /**
   * Price in USD — the currency the business actually quotes in.
   *
   * TL is derived at render time via `buildPrice()` and deliberately never
   * stored: the rate moves daily, and a frozen TL column would be wrong by
   * tomorrow. Sorting and price filtering also run off USD so a rate change
   * cannot silently reorder the catalogue.
   */
  priceUsd: number;
  /** Pre-discount USD price, when the product is on offer. */
  listPriceUsd?: number;

  stock: StockStatus;
  /** Units on hand. The client's product page prints this number directly. */
  stockQuantity: number;

  /** First entry is the primary image; the rest populate the gallery. */
  images: string[];
  /** Vehicle fitment lines, e.g. "RENAULT MEGANE IV 1.5 dCi". */
  vehicles: string[];
  specs: ProductSpec[];
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  isBestSeller?: boolean;
}

export const SORT_OPTIONS = [
  { value: "recommended", label: "Önerilen sıralama" },
  { value: "price-asc", label: "En düşük fiyat" },
  { value: "price-desc", label: "En yüksek fiyat" },
  { value: "newest", label: "En yeniler" },
  { value: "rating", label: "En yüksek puan" },
  { value: "discount", label: "İndirim oranı" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "recommended";

export function isSortValue(value: string | undefined): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

/** Query shape accepted by every listing page. */
export interface ProductQuery {
  brand?: string[];
  category?: string;
  vehicle?: string[];
  search?: string;
  /** Matches the stock code (SKU) only — the "Stok Kodu" field in Detaylı Arama. */
  stockCode?: string;
  inStockOnly?: boolean;
  /** Bounds are in TRY: that is the currency the shopper reads and types. */
  minPrice?: number;
  maxPrice?: number;
  sort?: SortValue;
  page?: number;
  perPage?: number;
}

export interface FacetValue {
  slug: string;
  label: string;
  count: number;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  facets: {
    brands: FacetValue[];
    categories: FacetValue[];
    vehicles: FacetValue[];
  };
  priceRange: { min: number; max: number };
}

export interface CartLine {
  productId: string;
  quantity: number;
}
