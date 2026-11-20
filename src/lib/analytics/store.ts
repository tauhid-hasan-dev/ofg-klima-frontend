import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { AnalyticsEvent, AnalyticsSummary } from "@/lib/analytics/types";

/**
 * Append-only analytics store.
 *
 * One JSON object per line under `.data/analytics.jsonl`. That choice is
 * deliberate for this stage of the project:
 *
 *  - Appending a line is atomic enough for concurrent requests on one node,
 *    and it cannot corrupt earlier events the way a rewritten JSON blob can.
 *  - There is no database yet. When one arrives, `record()` and `summarise()`
 *    are the only two functions that change.
 *
 * Its limits, stated rather than discovered later: it is per-instance, so a
 * scaled-out deployment splits the log across machines; and `summarise()`
 * reads the whole file, which is fine at the hundreds-of-thousands of events
 * this site will produce in a year and is not a plan for millions.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const LOG_PATH = path.join(DATA_DIR, "analytics.jsonl");

/** Caps a single read so a runaway log cannot exhaust memory. */
const MAX_EVENTS = 200_000;

export async function record(event: AnalyticsEvent): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LOG_PATH, `${JSON.stringify(event)}\n`, "utf8");
  } catch (error) {
    // Analytics must never break the page it is measuring.
    console.error("[analitik] olay yazılamadı:", error);
  }
}

async function readEvents(): Promise<AnalyticsEvent[]> {
  let raw: string;
  try {
    raw = await readFile(LOG_PATH, "utf8");
  } catch {
    return []; // No log yet — an empty dashboard, not an error.
  }

  const lines = raw.split("\n");
  const start = Math.max(0, lines.length - MAX_EVENTS);
  const events: AnalyticsEvent[] = [];

  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    try {
      events.push(JSON.parse(line) as AnalyticsEvent);
    } catch {
      // A torn final line from an interrupted write. Skip it; the rest of the
      // file is still perfectly good, which is the point of JSONL.
    }
  }

  return events;
}

function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

/** Collapses a search term for counting: case and spacing should not split it. */
function normaliseTerm(term: string): string {
  return term.trim().toLocaleLowerCase("tr").replace(/\s+/g, " ");
}

function topN<T>(map: Map<string, T>, count: (value: T) => number, limit: number): Array<[string, T]> {
  return Array.from(map.entries())
    .sort((a, b) => count(b[1]) - count(a[1]) || a[0].localeCompare(b[0], "tr"))
    .slice(0, limit);
}

/**
 * Aggregates the log into the dashboard's shape.
 *
 * `days` bounds the window. Everything is counted in one pass; the dashboard
 * asks four different questions of the same data and reading the file four
 * times to answer them would be the obvious way to make this slow.
 */
export async function summarise(days = 30, limit = 20): Promise<AnalyticsSummary> {
  const events = await readEvents();

  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 86_400_000);
  const fromDay = from.toISOString().slice(0, 10);

  const totals = { pageViews: 0, searches: 0, productViews: 0, whatsapp: 0 };
  const searches = new Map<string, { term: string; count: number }>();
  const products = new Map<string, { productId: string; productName: string; views: number; whatsapp: number }>();
  const daily = new Map<string, { date: string; pageViews: number; searches: number; whatsapp: number }>();
  const cities = new Map<string, number>();

  // Pre-seed every day in the window so the chart shows the quiet days too —
  // a gap in a time series reads as missing data, not as zero traffic.
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(from.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
    daily.set(date, { date, pageViews: 0, searches: 0, whatsapp: 0 });
  }

  for (const event of events) {
    const day = dayOf(event.at);
    if (day < fromDay) continue;

    const bucket = daily.get(day);

    switch (event.type) {
      case "page_view": {
        totals.pageViews += 1;
        if (bucket) bucket.pageViews += 1;
        const city = event.city?.trim() || "Bilinmiyor";
        cities.set(city, (cities.get(city) ?? 0) + 1);
        break;
      }
      case "search": {
        totals.searches += 1;
        if (bucket) bucket.searches += 1;
        if (event.term) {
          const key = normaliseTerm(event.term);
          if (key) {
            const existing = searches.get(key);
            if (existing) existing.count += 1;
            else searches.set(key, { term: event.term.trim(), count: 1 });
          }
        }
        break;
      }
      case "product_view": {
        totals.productViews += 1;
        if (event.productId) {
          const entry = products.get(event.productId) ?? {
            productId: event.productId,
            productName: event.productName ?? event.productId,
            views: 0,
            whatsapp: 0,
          };
          entry.views += 1;
          if (event.productName) entry.productName = event.productName;
          products.set(event.productId, entry);
        }
        break;
      }
      case "whatsapp": {
        totals.whatsapp += 1;
        if (bucket) bucket.whatsapp += 1;
        if (event.productId) {
          const entry = products.get(event.productId) ?? {
            productId: event.productId,
            productName: event.productName ?? event.productId,
            views: 0,
            whatsapp: 0,
          };
          entry.whatsapp += 1;
          if (event.productName) entry.productName = event.productName;
          products.set(event.productId, entry);
        }
        break;
      }
    }
  }

  return {
    range: { from: fromDay, to: to.toISOString().slice(0, 10), days },
    totals,
    topSearches: topN(searches, (value) => value.count, limit).map(([, value]) => value),
    // Ranked by WhatsApp hand-offs first: "en çok hangi ürünlere bakılıp
    // whatsapp'a geçiş olmuş" is the question, and a product with 200 views
    // and no enquiries is a different story from one with 20 and five.
    topProducts: Array.from(products.values())
      .sort((a, b) => b.whatsapp - a.whatsapp || b.views - a.views)
      .slice(0, limit),
    daily: Array.from(daily.values()).sort((a, b) => a.date.localeCompare(b.date)),
    cities: Array.from(cities.entries())
      .map(([city, visits]) => ({ city, visits }))
      .sort((a, b) => b.visits - a.visits),
  };
}
