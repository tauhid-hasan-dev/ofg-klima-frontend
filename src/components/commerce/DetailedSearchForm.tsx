"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronDownIcon, SearchIcon } from "@/components/ui/icons";
import { QUERY_KEYS } from "@/lib/search-params";
import type { Brand, Category } from "@/lib/types";
import { clsx } from "@/lib/utils";

/**
 * "Detaylı Arama" — the advanced search panel from the client's site.
 *
 * Field set and labels are taken verbatim from the recording: Anahtar Kelime,
 * Kategoriler, Markalar, Stok Kodu, Fiyat Aralığı.
 *
 * On submit the keyword becomes a **path segment** (`/arama/COROLLA`) rather
 * than a query parameter, matching their URL scheme; the remaining filters ride
 * along as query params so they stay shareable and the listing page can parse
 * them with the same code it uses everywhere else.
 */
export function DetailedSearchForm({
  categories,
  brands,
  initial,
}: {
  categories: Category[];
  brands: Brand[];
  initial?: {
    term?: string;
    category?: string;
    brand?: string;
    stockCode?: string;
    min?: string;
    max?: string;
  };
}) {
  const router = useRouter();
  const [term, setTerm] = useState(initial?.term ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [stockCode, setStockCode] = useState(initial?.stockCode ?? "");
  const [min, setMin] = useState(initial?.min ?? "");
  const [max, setMax] = useState(initial?.max ?? "");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (category) params.set("kategori", category);
    if (brand) params.set(QUERY_KEYS.brand, brand);
    if (stockCode.trim()) params.set("stokkodu", stockCode.trim());
    if (min) params.set(QUERY_KEYS.min, min);
    if (max) params.set(QUERY_KEYS.max, max);

    const qs = params.toString();
    const trimmed = term.trim();

    // Keyword in the path, filters in the query — their scheme exactly.
    const path = trimmed ? `/arama/${encodeURIComponent(trimmed)}` : "/arama";
    router.push(qs ? `${path}?${qs}` : path);
  }

  const field =
    "h-11 w-full rounded-md border border-ink-300 bg-white px-3 text-[0.95rem] text-ink-900 outline-none transition-colors focus:border-navy-700 placeholder:text-ink-400";

  return (
    <form onSubmit={onSubmit} className="rounded-card bg-white p-5 ring-1 ring-ink-200 sm:p-6">
      <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-950">Detaylı Arama</h2>

      <div className="mt-5 space-y-4">
        <div className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:items-center">
          <label htmlFor="ds-term" className="text-sm font-semibold text-ink-700">
            Anahtar Kelime
          </label>
          <input
            id="ds-term"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Örn. COROLLA, kompresör, Megane"
            className={field}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:items-center">
          <label htmlFor="ds-category" className="text-sm font-semibold text-ink-700">
            Kategoriler
          </label>
          <div className="relative">
            <select
              id="ds-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={clsx(field, "appearance-none pr-10")}
            >
              <option value="">Tümü</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink-500" />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:items-center">
          <label htmlFor="ds-brand" className="text-sm font-semibold text-ink-700">
            Markalar
          </label>
          <div className="relative">
            <select
              id="ds-brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className={clsx(field, "appearance-none pr-10")}
            >
              <option value="">Tümü</option>
              {brands.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink-500" />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:items-center">
          <label htmlFor="ds-stock" className="text-sm font-semibold text-ink-700">
            Stok Kodu
          </label>
          <input
            id="ds-stock"
            value={stockCode}
            onChange={(event) => setStockCode(event.target.value)}
            placeholder="Örn. YP-SD5S146634-ORJ"
            className={clsx(field, "font-mono text-[0.9rem]")}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:items-center">
          <span className="text-sm font-semibold text-ink-700">Fiyat Aralığı</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={min}
              onChange={(event) => setMin(event.target.value)}
              aria-label="En düşük fiyat (TL)"
              placeholder="Min TL"
              className={clsx(field, "tabular")}
            />
            <span className="text-ink-400">–</span>
            <input
              type="number"
              inputMode="numeric"
              value={max}
              onChange={(event) => setMax(event.target.value)}
              aria-label="En yüksek fiyat (TL)"
              placeholder="Max TL"
              className={clsx(field, "tabular")}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg">
          <SearchIcon className="h-5 w-5" />
          Ara
        </Button>
        <p className="text-xs text-ink-500">Fiyat aralığı TL cinsindendir.</p>
      </div>
    </form>
  );
}
