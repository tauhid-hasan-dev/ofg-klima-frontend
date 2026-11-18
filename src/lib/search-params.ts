import { DEFAULT_PER_PAGE } from "@/lib/repository";
import { DEFAULT_SORT, isSortValue, type ProductQuery } from "@/lib/types";

/** The shape Next.js hands to a server page via `searchParams`. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : value.split(",");
  return list.map((item) => item.trim()).filter(Boolean);
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Parses the querystring into a `ProductQuery`. Unknown or malformed values
 * fall back to defaults rather than throwing — a hand-edited URL should degrade
 * to a sane listing, not a 500.
 */
export function parseProductQuery(params: RawSearchParams): ProductQuery {
  const sortRaw = Array.isArray(params.siralama) ? params.siralama[0] : params.siralama;
  const pageRaw = toNumber(params.sayfa);
  const search = Array.isArray(params.q) ? params.q[0] : params.q;

  return {
    brand: toArray(params.marka),
    vehicle: toArray(params.arac),
    search: search?.trim() || undefined,
    stockCode: (Array.isArray(params.stokkodu) ? params.stokkodu[0] : params.stokkodu)?.trim() || undefined,
    category: (Array.isArray(params.kategori) ? params.kategori[0] : params.kategori)?.trim() || undefined,
    inStockOnly: params.stok === "1" || params.stok === "true",
    minPrice: toNumber(params.min),
    maxPrice: toNumber(params.max),
    sort: isSortValue(sortRaw) ? sortRaw : DEFAULT_SORT,
    page: pageRaw && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    perPage: DEFAULT_PER_PAGE,
  };
}

/** Turkish querystring keys, kept in one place so links and parsing can't drift. */
export const QUERY_KEYS = {
  brand: "marka",
  vehicle: "arac",
  search: "q",
  inStock: "stok",
  min: "min",
  max: "max",
  sort: "siralama",
  page: "sayfa",
  stockCode: "stokkodu",
  category: "kategori",
} as const;

export interface BuildUrlOptions {
  /** Toggle a value inside a multi-select facet. */
  toggle?: { key: string; value: string };
  /** Set (or clear, with `null`) a single-value param. */
  set?: Record<string, string | number | null | undefined>;
  /** Remove these keys entirely. */
  remove?: string[];
  /** Reset pagination. Defaults to true, since any filter change invalidates it. */
  resetPage?: boolean;
}

/**
 * Builds a listing URL from the current params plus a change. Centralising this
 * is what keeps the sidebar, the sort dropdown and the pagination in agreement
 * about the URL schema.
 */
export function buildListingUrl(
  pathname: string,
  current: URLSearchParams,
  options: BuildUrlOptions = {},
): string {
  const next = new URLSearchParams(current.toString());
  const { toggle, set, remove, resetPage = true } = options;

  if (toggle) {
    const existing = next.getAll(toggle.key).flatMap((value) => value.split(","));
    const filtered = existing.filter(Boolean);
    const isActive = filtered.includes(toggle.value);
    const updated = isActive
      ? filtered.filter((value) => value !== toggle.value)
      : [...filtered, toggle.value];

    next.delete(toggle.key);
    if (updated.length > 0) next.set(toggle.key, updated.join(","));
  }

  if (set) {
    for (const [key, value] of Object.entries(set)) {
      if (value === null || value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    }
  }

  for (const key of remove ?? []) next.delete(key);

  if (resetPage && !(set && QUERY_KEYS.page in set)) next.delete(QUERY_KEYS.page);

  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** True when any facet is active — drives the "clear all" affordance. */
export function hasActiveFilters(params: URLSearchParams): boolean {
  const facetKeys: string[] = [
    QUERY_KEYS.brand,
    QUERY_KEYS.vehicle,
    QUERY_KEYS.inStock,
    QUERY_KEYS.min,
    QUERY_KEYS.max,
  ];
  return facetKeys.some((key) => Boolean(params.get(key)));
}
