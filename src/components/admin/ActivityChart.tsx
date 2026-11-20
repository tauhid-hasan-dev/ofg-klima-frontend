"use client";

import { useState } from "react";
import { formatDate, formatNumber } from "@/lib/format";
import { clsx } from "@/lib/utils";

/**
 * Day-by-day activity — requirement 16's "gün gün" chart.
 *
 * ## Why three small multiples and not one chart with three lines
 *
 * Page views outnumber WhatsApp hand-offs by one to two orders of magnitude.
 * On a shared axis the WhatsApp series is a flat line along zero — the series
 * the client actually cares about would be the one you cannot read. The
 * alternative people reach for is a second y-axis, which makes two unrelated
 * scales look comparable and is the single most misleading thing a chart can
 * do. Three rows, each scaled to its own maximum and labelled with it, keeps
 * every series readable and never implies a comparison the data cannot support.
 *
 * Hovering any column reads all three rows for that day, which is the
 * cross-series comparison worth having — exact numbers, not shared geometry.
 *
 * Colours: validated as a categorical trio (lightness band, chroma floor,
 * CVD separation, contrast). The amber/green pair sits in the 6–8 ΔE floor
 * band under deuteranopia, which is legal here because each row carries its
 * own text label — identity never rests on colour alone.
 */

export interface DayRow {
  date: string;
  pageViews: number;
  searches: number;
  whatsapp: number;
}

const SERIES = [
  { key: "pageViews", label: "Sayfa görüntüleme", color: "#2f6fb0" },
  { key: "searches", label: "Arama", color: "#c77700" },
  { key: "whatsapp", label: "WhatsApp'a geçiş", color: "#1da851" },
] as const;

export function ActivityChart({ data }: { data: DayRow[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-400">Henüz hareket kaydı yok.</p>;
  }

  const active = hovered !== null ? data[hovered] : null;

  return (
    <div>
      <div className="space-y-5">
        {SERIES.map((series) => {
          // Each row is scaled to its own maximum; the figure is printed so
          // nobody has to guess what full height means. `scale` carries the
          // divide-by-zero floor separately — printing the floor as if it were
          // the maximum told the reader there was a 1 in a row of zeroes.
          const max = data.reduce((highest, row) => Math.max(highest, row[series.key]), 0);
          const scale = Math.max(1, max);

          return (
            <div key={series.key}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-ink-700">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-[2px]"
                    style={{ backgroundColor: series.color }}
                  />
                  {series.label}
                </p>
                <p className="text-[0.7rem] text-ink-400 tabular">
                  {max > 0 ? `en yüksek ${formatNumber(max, 0)}` : "kayıt yok"}
                </p>
              </div>

              <div className="mt-1.5 flex h-16 items-end gap-[2px]">
                {data.map((row, index) => {
                  const value = row[series.key];
                  const height = (value / scale) * 100;

                  return (
                    <div
                      key={row.date}
                      onMouseEnter={() => setHovered(index)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(index)}
                      onBlur={() => setHovered(null)}
                      tabIndex={-1}
                      // The column is the hit target, not the bar: a day with
                      // one event would otherwise be a 1px-tall thing to aim at.
                      className={clsx(
                        "flex h-full flex-1 items-end rounded-sm transition-colors",
                        hovered === index ? "bg-ink-100" : "bg-transparent",
                      )}
                    >
                      <span
                        className="w-full rounded-t-[3px]"
                        style={{
                          height: `${Math.max(value > 0 ? 3 : 0, height)}%`,
                          backgroundColor: series.color,
                          // Dim the rest of the row rather than highlighting
                          // the hovered bar — keeps the hovered column reading
                          // as one vertical slice across all three charts.
                          opacity: hovered === null || hovered === index ? 1 : 0.35,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Readout rather than a floating tooltip: three values for one day do
          not fit a 30-column strip without covering the bars they describe. */}
      <div className="mt-4 flex min-h-[2.75rem] flex-wrap items-center gap-x-5 gap-y-1 rounded-md bg-ink-50 px-3 py-2 text-sm">
        {active ? (
          <>
            <span className="font-semibold text-ink-950">{formatDate(active.date)}</span>
            {SERIES.map((series) => (
              <span key={series.key} className="flex items-center gap-1.5 text-ink-700">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                {series.label}:{" "}
                <strong className="font-semibold text-ink-950 tabular">
                  {formatNumber(active[series.key], 0)}
                </strong>
              </span>
            ))}
          </>
        ) : (
          <span className="text-ink-400">
            Günlük değerleri görmek için grafiğin üzerine gelin.
          </span>
        )}
      </div>

      <div className="mt-2 flex justify-between text-[0.7rem] text-ink-400 tabular">
        <span>{formatDate(data[0].date)}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>

      {/* The numbers themselves, for screen readers and for anyone who wants
          to read the series rather than look at it. */}
      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-semibold text-ink-600 hover:text-ink-900">
          Verileri tablo olarak göster
        </summary>
        <div className="mt-2 max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-ink-200 text-left text-xs font-semibold tracking-wide text-ink-500 uppercase">
                <th scope="col" className="py-1.5">Gün</th>
                {SERIES.map((series) => (
                  <th key={series.key} scope="col" className="py-1.5 text-right">
                    {series.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.date} className="border-b border-ink-100 last:border-b-0">
                  <td className="py-1.5 text-ink-700 tabular">{formatDate(row.date)}</td>
                  {SERIES.map((series) => (
                    <td key={series.key} className="py-1.5 text-right text-ink-800 tabular">
                      {formatNumber(row[series.key], 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
