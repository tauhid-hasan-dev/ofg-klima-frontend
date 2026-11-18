"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterDrawer, type SidebarProps } from "@/components/commerce/FilterSidebar";
import { ChevronDownIcon, CloseIcon, GridFourIcon, GridTwoIcon, ListIcon } from "@/components/ui/icons";
import { QUERY_KEYS, buildListingUrl } from "@/lib/search-params";
import { SORT_OPTIONS, type SortValue } from "@/lib/types";
import { VIEW_KEY, type ViewMode } from "@/lib/view-mode";
import { clsx } from "@/lib/utils";

export const VIEW_MODES: { value: ViewMode; label: string; Icon: typeof GridFourIcon }[] = [
  { value: "4", label: "Sık ızgara", Icon: GridFourIcon },
  { value: "3", label: "Geniş ızgara", Icon: GridTwoIcon },
  { value: "liste", label: "Liste", Icon: ListIcon },
];

/** Chips for every active facet, so the user can undo one at a time. */
export function ActiveFilterChips({
  pathname,
  labels,
}: {
  pathname: string;
  labels: Record<string, string>;
}) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const chips: { key: string; value: string; label: string }[] = [];

  for (const key of [QUERY_KEYS.brand, QUERY_KEYS.vehicle]) {
    for (const value of params.getAll(key).flatMap((entry) => entry.split(",")).filter(Boolean)) {
      chips.push({ key, value, label: labels[value] ?? value });
    }
  }
  if (params.get(QUERY_KEYS.inStock) === "1") {
    chips.push({ key: QUERY_KEYS.inStock, value: "1", label: "Sadece stoktakiler" });
  }

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={`${chip.key}-${chip.value}`}>
          <Link
            href={
              chip.key === QUERY_KEYS.inStock
                ? buildListingUrl(pathname, params, { set: { [chip.key]: null } })
                : buildListingUrl(pathname, params, { toggle: { key: chip.key, value: chip.value } })
            }
            scroll={false}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-300 bg-white py-1 pr-2 pl-3 text-xs font-semibold text-ink-800 transition-colors hover:border-signal-500 hover:text-signal-500"
          >
            {chip.label}
            <CloseIcon className="h-3.5 w-3.5" />
            <span className="sr-only">filtresini kaldır</span>
          </Link>
        </li>
      ))}

      <li>
        <Link
          href={pathname}
          scroll={false}
          className="text-xs font-semibold text-signal-500 underline underline-offset-2"
        >
          Tümünü temizle
        </Link>
      </li>
    </ul>
  );
}

export function ListingToolbar({
  pathname,
  total,
  sort,
  view,
  sidebar,
  activeCount,
}: {
  pathname: string;
  total: number;
  sort: SortValue;
  view: ViewMode;
  sidebar: SidebarProps;
  activeCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-white p-3 ring-1 ring-ink-200">
      <div className="flex items-center gap-3">
        <FilterDrawer {...sidebar} activeCount={activeCount} />
        <p className="text-sm text-ink-600">
          Toplam <strong className="font-bold text-ink-950 tabular">{total}</strong> ürün
        </p>
      </div>

      <div className="flex items-center gap-2">
        <label className="relative">
          <span className="sr-only">Sıralama</span>
          <select
            value={sort}
            onChange={(event) => {
              router.push(
                buildListingUrl(pathname, params, {
                  set: { [QUERY_KEYS.sort]: event.target.value },
                }),
                { scroll: false },
              );
            }}
            className="h-10 appearance-none rounded-md border border-ink-300 bg-white py-0 pr-9 pl-3 text-sm font-medium text-ink-800 outline-none focus:border-ink-900"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-ink-500" />
        </label>

        <div className="hidden items-center gap-0.5 rounded-md border border-ink-300 p-0.5 sm:flex">
          {VIEW_MODES.map(({ value, label, Icon }) => {
            const isActive = value === view;
            return (
              <Link
                key={value}
                href={buildListingUrl(pathname, params, { set: { [VIEW_KEY]: value }, resetPage: false })}
                scroll={false}
                aria-label={label}
                aria-current={isActive ? "true" : undefined}
                className={clsx(
                  "grid h-8 w-9 place-items-center rounded transition-colors",
                  isActive ? "bg-ink-950 text-brand-400" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900",
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
