"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckIcon, ChevronDownIcon, CloseIcon, FilterIcon, SearchIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { QUERY_KEYS, buildListingUrl, hasActiveFilters } from "@/lib/search-params";
import type { Category, FacetValue } from "@/lib/types";
import { clsx } from "@/lib/utils";

export interface SidebarProps {
  pathname: string;
  facets: {
    brands: FacetValue[];
    vehicles: FacetValue[];
  };
  priceRange: { min: number; max: number };
  /** Category links shown under "Ürün Grupları". */
  categoryLinks: Category[];
  /**
   * Children keyed by parent slug, so a group can expand in place
   * (requirement 8). Absent for pages that only pass a flat list.
   */
  categoryChildren?: Record<string, Category[]>;
  /** The category the page is currently showing, expanded by default. */
  activeCategory?: string;
  /** Facets the page itself pins (e.g. the brand on /marka/sanden). */
  lockedFilters?: { label: string; value: string }[];
  /** Hide the brand facet where it would be a single locked value. */
  showBrandFacet?: boolean;
}

const COLLAPSE_AFTER = 8;

function FacetGroup({
  title,
  queryKey,
  values,
  pathname,
  params,
  onNavigate,
}: {
  title: string;
  queryKey: string;
  values: FacetValue[];
  pathname: string;
  params: URLSearchParams;
  onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("");

  if (values.length === 0) return null;

  const selected = new Set(
    params.getAll(queryKey).flatMap((value) => value.split(",")).filter(Boolean),
  );

  const matching = filter
    ? values.filter((value) => value.label.toLocaleLowerCase("tr").includes(filter.toLocaleLowerCase("tr")))
    : values;
  const visible = showAll ? matching : matching.slice(0, COLLAPSE_AFTER);

  return (
    <section className="border-b border-ink-200 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left font-display text-sm font-bold tracking-wide text-ink-950 uppercase"
        >
          {title}
          <ChevronDownIcon className={clsx("h-4 w-4 transition-transform duration-200", !open && "-rotate-90")} />
        </button>
      </h3>

      {open ? (
        <div className="px-4 pb-4">
          {values.length > COLLAPSE_AFTER ? (
            <div className="relative mb-2.5">
              <SearchIcon className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder={`${title} ara`}
                aria-label={`${title} içinde ara`}
                className="h-9 w-full rounded-md border border-ink-200 bg-white pr-2 pl-8 text-sm outline-none focus:border-ink-900"
              />
            </div>
          ) : null}

          <ul className="space-y-0.5">
            {visible.map((value) => {
              const isSelected = selected.has(value.slug);
              const href = buildListingUrl(pathname, params, {
                toggle: { key: queryKey, value: value.slug },
              });

              return (
                <li key={value.slug}>
                  <Link
                    href={href}
                    scroll={false}
                    onClick={() => onNavigate(href)}
                    className="group flex items-center gap-2.5 rounded px-1 py-1.5 text-sm transition-colors hover:bg-ink-50"
                  >
                    <span
                      className={clsx(
                        "grid h-[1.1rem] w-[1.1rem] shrink-0 place-items-center rounded-[3px] border transition-colors",
                        isSelected
                          ? "border-ink-950 bg-ink-950 text-brand-400"
                          : "border-ink-300 bg-white group-hover:border-ink-500",
                      )}
                      aria-hidden="true"
                    >
                      {isSelected ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className={clsx("min-w-0 flex-1 truncate", isSelected ? "font-semibold text-ink-950" : "text-ink-700")}>
                      {value.label}
                    </span>
                    <span className="shrink-0 text-xs text-ink-400 tabular">{value.count}</span>
                    <span className="sr-only">{isSelected ? "— seçili, kaldırmak için tıklayın" : ""}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {matching.length > COLLAPSE_AFTER ? (
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              className="mt-2 text-xs font-semibold text-ink-600 underline underline-offset-2 hover:text-ink-900"
            >
              {showAll ? "Daha az göster" : `+${matching.length - COLLAPSE_AFTER} tane daha`}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/**
 * "Ürün Grupları" — requirement 8.
 *
 * "kategori seçildiğinde alt başlıklar çıkmalı": picking a group reveals its
 * sub-headings in place rather than navigating away and redrawing the rail.
 * The group header is a link (it is a real category page) and the chevron is a
 * separate button, so expanding to look does not cost you a page load, and
 * clicking the name still takes you there — the two intents the one row has to
 * serve without stealing from each other.
 */
function CategoryTree({
  categories,
  childrenBySlug,
  activeCategory,
  onNavigate,
}: {
  categories: Category[];
  childrenBySlug?: Record<string, Category[]>;
  activeCategory?: string;
  onNavigate: (href: string) => void;
}) {
  // Whatever the page is showing starts open; everything else starts closed.
  const [expanded, setExpanded] = useState<string | null>(activeCategory ?? null);

  return (
    <section className="px-4 py-3.5">
      <h3 className="font-display text-sm font-bold tracking-wide text-ink-950 uppercase">Ürün Grupları</h3>

      <ul className="mt-2.5">
        {categories.map((category) => {
          const children = childrenBySlug?.[category.slug] ?? [];
          const isOpen = expanded === category.slug;
          const isActive = activeCategory === category.slug;

          return (
            <li key={category.slug} className="border-b border-ink-100 last:border-b-0">
              <div className="flex items-stretch">
                <Link
                  href={`/kategori/${category.slug}`}
                  onClick={() => onNavigate(`/kategori/${category.slug}`)}
                  className={clsx(
                    "flex-1 rounded px-1 py-2 text-sm transition-colors hover:text-ink-950",
                    isActive ? "font-semibold text-brand-600" : "text-ink-700",
                  )}
                >
                  {category.name}
                </Link>

                {children.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : category.slug)}
                    aria-expanded={isOpen}
                    aria-label={`${category.name} alt kategorileri`}
                    className="grid w-8 shrink-0 place-items-center text-ink-400 transition-colors hover:text-ink-900"
                  >
                    <ChevronDownIcon
                      className={clsx("h-4 w-4 transition-transform duration-200", !isOpen && "-rotate-90")}
                    />
                  </button>
                ) : null}
              </div>

              {isOpen && children.length > 0 ? (
                <ul className="mb-1.5 ml-1 border-l-2 border-ink-200 pl-3">
                  {children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/kategori/${child.slug}`}
                        onClick={() => onNavigate(`/kategori/${child.slug}`)}
                        className={clsx(
                          "block rounded px-1 py-1.5 text-sm transition-colors hover:bg-ink-50 hover:text-ink-950",
                          activeCategory === child.slug ? "font-semibold text-brand-600" : "text-ink-600",
                        )}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SidebarBody({
  pathname,
  facets,
  priceRange,
  categoryLinks,
  categoryChildren,
  activeCategory,
  lockedFilters,
  showBrandFacet = true,
  onNavigate,
}: SidebarProps & { onNavigate: (href: string) => void }) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const inStockOnly = params.get(QUERY_KEYS.inStock) === "1";

  const [minPrice, setMinPrice] = useState(params.get(QUERY_KEYS.min) ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get(QUERY_KEYS.max) ?? "");
  const router = useRouter();

  function applyPrice() {
    const href = buildListingUrl(pathname, params, {
      set: {
        [QUERY_KEYS.min]: minPrice || null,
        [QUERY_KEYS.max]: maxPrice || null,
      },
    });
    onNavigate(href);
    router.push(href, { scroll: false });
  }

  return (
    <div className="divide-y divide-ink-200 overflow-hidden rounded-card bg-white ring-1 ring-ink-200">
      {/* Pinned context, e.g. the brand on a brand page */}
      {lockedFilters && lockedFilters.length > 0 ? (
        <section className="px-4 py-3.5">
          <h3 className="font-display text-sm font-bold tracking-wide text-ink-950 uppercase">Seçimleriniz</h3>
          <ul className="mt-2.5 space-y-1.5">
            {lockedFilters.map((item) => (
              <li
                key={item.value}
                className="flex items-center justify-between gap-2 rounded border border-ink-200 bg-ink-50 px-3 py-2 text-sm font-semibold text-ink-900"
              >
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-medium tracking-wide text-ink-500 uppercase">
                    {item.label}
                  </span>
                  <span className="truncate">{item.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {categoryLinks.length > 0 ? (
        <CategoryTree
          categories={categoryLinks}
          childrenBySlug={categoryChildren}
          activeCategory={activeCategory}
          onNavigate={onNavigate}
        />
      ) : null}

      <section className="px-4 py-3.5">
        <Link
          href={buildListingUrl(pathname, params, {
            set: { [QUERY_KEYS.inStock]: inStockOnly ? null : "1" },
          })}
          scroll={false}
          onClick={() =>
            onNavigate(
              buildListingUrl(pathname, params, { set: { [QUERY_KEYS.inStock]: inStockOnly ? null : "1" } }),
            )
          }
          className="group flex items-center gap-2.5 text-sm"
        >
          <span
            className={clsx(
              "grid h-[1.1rem] w-[1.1rem] shrink-0 place-items-center rounded-[3px] border transition-colors",
              inStockOnly ? "border-ink-950 bg-ink-950 text-brand-400" : "border-ink-300 bg-white group-hover:border-ink-500",
            )}
            aria-hidden="true"
          >
            {inStockOnly ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : null}
          </span>
          <span className={clsx(inStockOnly ? "font-semibold text-ink-950" : "text-ink-700")}>
            Sadece stoktakiler
          </span>
        </Link>
      </section>

      {showBrandFacet ? (
        <FacetGroup
          title="Marka"
          queryKey={QUERY_KEYS.brand}
          values={facets.brands}
          pathname={pathname}
          params={params}
          onNavigate={onNavigate}
        />
      ) : null}

      <FacetGroup
        title="Araç Markası"
        queryKey={QUERY_KEYS.vehicle}
        values={facets.vehicles}
        pathname={pathname}
        params={params}
        onNavigate={onNavigate}
      />

      <section className="px-4 py-3.5">
        <h3 className="font-display text-sm font-bold tracking-wide text-ink-950 uppercase">Fiyat Aralığı</h3>
        <p className="mt-1 text-xs text-ink-500 tabular">
          {formatPrice(priceRange.min)} – {formatPrice(priceRange.max)}
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder={String(priceRange.min)}
            aria-label="En düşük fiyat"
            className="h-9 w-full min-w-0 rounded-md border border-ink-200 px-2 text-sm tabular outline-none focus:border-ink-900"
          />
          <span className="text-ink-400">–</span>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder={String(priceRange.max)}
            aria-label="En yüksek fiyat"
            className="h-9 w-full min-w-0 rounded-md border border-ink-200 px-2 text-sm tabular outline-none focus:border-ink-900"
          />
        </div>
        <Button type="button" onClick={applyPrice} variant="outline" size="sm" fullWidth className="mt-2.5">
          Uygula
        </Button>
      </section>

      {hasActiveFilters(params) ? (
        <section className="px-4 py-3.5">
          <Link
            href={buildListingUrl(pathname, new URLSearchParams(), {})}
            scroll={false}
            onClick={() => onNavigate(pathname)}
            className="flex items-center justify-center gap-1.5 rounded-md border border-signal-500 py-2 text-sm font-semibold text-signal-500 transition-colors hover:bg-signal-500 hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
            Filtreleri Temizle
          </Link>
        </section>
      ) : null}
    </div>
  );
}

/** Desktop rail. */
export function FilterSidebar(props: SidebarProps) {
  return (
    <aside className="hidden w-[17.5rem] shrink-0 lg:block">
      <SidebarBody {...props} onNavigate={() => {}} />
    </aside>
  );
}

/** Mobile equivalent — same body, presented as a bottom-anchored sheet. */
export function FilterDrawer(props: SidebarProps & { activeCount: number }) {
  const [open, setOpen] = useState(false);
  // `pathname` arrives as a prop. Reading it from usePathname() here would make
  // the drawer depend on URL data, which blocks the static shell on routes that
  // are not prerendered (e.g. /arama/[terim]).

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-md border border-ink-300 px-3 text-sm font-semibold text-ink-800 lg:hidden"
      >
        <FilterIcon className="h-5 w-5" />
        Filtrele
        {props.activeCount > 0 ? (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink-950 px-1 text-[0.68rem] font-bold text-brand-400 tabular">
            {props.activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            aria-label="Filtreleri kapat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/60"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtreler"
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl bg-ink-50"
          >
            <div className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3">
              <h2 className="font-display text-base font-bold tracking-tight uppercase">Filtreler</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="grid h-9 w-9 place-items-center rounded-md text-ink-600 hover:bg-ink-100"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-3">
              <SidebarBody {...props} onNavigate={() => setOpen(false)} />
            </div>

            <div className="border-t border-ink-200 bg-white p-3">
              <Button type="button" onClick={() => setOpen(false)} fullWidth>
                Sonuçları Göster
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
