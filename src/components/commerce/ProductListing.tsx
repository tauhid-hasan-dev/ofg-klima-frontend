import Link from "next/link";
import { FilterSidebar, type SidebarProps } from "@/components/commerce/FilterSidebar";
import { ActiveFilterChips, ListingToolbar } from "@/components/commerce/ListingToolbar";
import { Pagination } from "@/components/commerce/Pagination";
import { ProductGrid } from "@/components/commerce/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { SearchIcon, WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/format";
import type { RawSearchParams } from "@/lib/search-params";
import { QUERY_KEYS } from "@/lib/search-params";
import { site } from "@/lib/site";
import type { Category, ProductListResult, SortValue } from "@/lib/types";
import { parseViewMode } from "@/lib/view-mode";

/**
 * Shared listing body for /marka/[slug], /kategori/[slug] and /arama.
 *
 * Everything that varies between those three — the heading, the pinned facets,
 * which sidebar groups are shown — arrives as props, so the three pages stay
 * thin and the filter/sort/paginate behaviour is defined exactly once.
 */
export function ProductListing({
  pathname,
  searchParams,
  result,
  sort,
  categoryLinks,
  lockedFilters,
  showBrandFacet = true,
  emptyTitle = "Aradığınız kriterlere uygun ürün bulunamadı",
  emptyBody = "Filtreleri gevşetmeyi ya da parça kodu ile aramayı deneyin. Doğru parçayı bulamadıysanız WhatsApp'tan yazın, birlikte seçelim.",
}: {
  pathname: string;
  searchParams: RawSearchParams;
  result: ProductListResult;
  sort: SortValue;
  categoryLinks: Category[];
  lockedFilters?: { label: string; value: string }[];
  showBrandFacet?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  const view = parseViewMode(searchParams.gorunum);

  const sidebarProps: SidebarProps = {
    pathname,
    facets: { brands: result.facets.brands, vehicles: result.facets.vehicles },
    priceRange: result.priceRange,
    categoryLinks,
    lockedFilters,
    showBrandFacet,
  };

  // Label lookup for the active-filter chips, built from the facets we already
  // computed rather than a second pass over the catalogue.
  const facetLabels: Record<string, string> = {};
  for (const facet of [...result.facets.brands, ...result.facets.vehicles]) {
    facetLabels[facet.slug] = facet.label;
  }

  const activeCount =
    (searchParams[QUERY_KEYS.brand] ? String(searchParams[QUERY_KEYS.brand]).split(",").length : 0) +
    (searchParams[QUERY_KEYS.vehicle] ? String(searchParams[QUERY_KEYS.vehicle]).split(",").length : 0) +
    (searchParams[QUERY_KEYS.inStock] === "1" ? 1 : 0);

  const brandNames: Record<string, string> = {};
  for (const facet of result.facets.brands) brandNames[facet.slug] = facet.label;

  return (
    <div className="flex items-start gap-6 pb-12">
      <FilterSidebar {...sidebarProps} />

      <div className="min-w-0 flex-1">
        <ListingToolbar
          pathname={pathname}
          total={result.total}
          sort={sort}
          view={view}
          sidebar={sidebarProps}
          activeCount={activeCount}
        />

        {activeCount > 0 ? (
          <div className="mt-3">
            <ActiveFilterChips pathname={pathname} labels={facetLabels} />
          </div>
        ) : null}

        {result.items.length > 0 ? (
          <>
            <div className="mt-4">
              <ProductGrid
                products={result.items}
                brandNames={brandNames}
                layout={view === "liste" ? "list" : "grid"}
                columns={view === "3" ? 3 : 4}
              />
            </div>

            <Pagination
              pathname={pathname}
              searchParams={searchParams}
              page={result.page}
              pageCount={result.pageCount}
            />

            <p className="mt-4 text-center text-sm text-ink-500 tabular">
              {result.total} üründen {(result.page - 1) * result.perPage + 1}–
              {Math.min(result.page * result.perPage, result.total)} arası gösteriliyor
            </p>
          </>
        ) : (
          <div className="mt-4 rounded-card bg-white px-6 py-16 text-center ring-1 ring-ink-200">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink-100 text-ink-400">
              <SearchIcon className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-ink-950">{emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">{emptyBody}</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href={pathname} variant="outline">
                Filtreleri temizle
              </ButtonLink>
              <ButtonLink
                href={whatsappLink(site.whatsapp, "Merhaba, aradığım parçayı sitede bulamadım. Yardımcı olur musunuz?")}
                external
                variant="whatsapp"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp&apos;tan sor
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Small helper used by the empty states and the 404 page. */
export function QuickLinks({ items }: { items: { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="inline-flex rounded-full border border-ink-300 px-3.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-ink-900 hover:text-ink-950"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
