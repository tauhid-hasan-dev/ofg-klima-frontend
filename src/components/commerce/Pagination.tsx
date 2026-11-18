import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { QUERY_KEYS, buildListingUrl, type RawSearchParams } from "@/lib/search-params";
import { clsx } from "@/lib/utils";
import { paginationRange } from "@/lib/utils";

/**
 * Server-rendered pager: every page is a real, crawlable, shareable URL rather
 * than client state. That matters for a catalogue this size — deep pages need
 * to be indexable.
 */
export function Pagination({
  pathname,
  searchParams,
  page,
  pageCount,
}: {
  pathname: string;
  searchParams: RawSearchParams;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const base = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((entry) => base.append(key, entry));
    else base.set(key, value);
  }

  function hrefFor(target: number): string {
    return buildListingUrl(pathname, base, {
      set: { [QUERY_KEYS.page]: target === 1 ? null : target },
      resetPage: false,
    });
  }

  const items = paginationRange(page, pageCount);
  const cell =
    "grid h-10 min-w-10 place-items-center rounded-md px-2.5 text-sm font-semibold transition-colors tabular";

  return (
    <nav aria-label="Sayfalama" className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" aria-label="Önceki sayfa" className={clsx(cell, "border border-ink-300 text-ink-700 hover:border-ink-900 hover:text-ink-950")}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={clsx(cell, "border border-ink-200 text-ink-300")}>
          <ChevronLeftIcon className="h-4 w-4" />
        </span>
      )}

      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-ink-400">
            …
          </span>
        ) : item === page ? (
          <span key={item} aria-current="page" className={clsx(cell, "bg-ink-950 text-brand-400")}>
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            className={clsx(cell, "border border-ink-300 text-ink-700 hover:border-ink-900 hover:text-ink-950")}
          >
            {item}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" aria-label="Sonraki sayfa" className={clsx(cell, "border border-ink-300 text-ink-700 hover:border-ink-900 hover:text-ink-950")}>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={clsx(cell, "border border-ink-200 text-ink-300")}>
          <ChevronRightIcon className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
