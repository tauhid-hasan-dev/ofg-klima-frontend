import type { ExchangeRates } from "@/lib/currency";

/**
 * TCMB exchange rates — requirement 10.
 *
 * DIA stores prices in USD (the "Fiyat 6" column, flagged USD on the ERP's
 * price card). The site must show TL computed at the Merkez Bankası rate, so
 * this module is the single place that rate comes from.
 *
 * ## Why the rate is read synchronously
 *
 * A price appears on every card, in every list, in the buy box and in the
 * cart. Making the rate an awaited value would turn every one of those into an
 * async boundary for a number that changes once a day. Instead the rate lives
 * in a module-level cache that `getRates()` reads synchronously, and a
 * background refresh keeps it current. Renders are never blocked on TCMB, and
 * a TCMB outage degrades to the last good rate rather than to an error page.
 *
 * ## Freshness
 *
 * TCMB publishes once per working day, around 15:30 Europe/Istanbul. A timer
 * started when this module loads refreshes the cache hourly; `POST /api/kur`
 * forces a refresh for a cron to call after the daily publication.
 *
 * The refresh is driven by a timer rather than checked on read, deliberately.
 * `getRates()` is called from inside React renders, and under Next's Cache
 * Components a render that reads `Date.now()` is a prerender error — the time
 * is not something a cached render may depend on. Keeping the read pure and
 * the clock in the timer sidesteps that entirely.
 *
 * NOTE: the cache is per server instance. On a single Node deployment that is
 * exactly one cache. On a scaled-out serverless deployment each instance keeps
 * its own, which is harmless here (they all converge on the same TCMB figure)
 * but means `asOf` can differ by minutes between instances.
 */

const TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";

/** Refresh at most this often. TCMB publishes daily; hourly is generous. */
const TTL_MS = 60 * 60 * 1000;

/**
 * Last-known-good rate, used until the first successful TCMB read.
 *
 * This is the "Serbest Piyasa Satış" figure from the client's own ERP
 * dashboard (Döviz Kurları, 22.10.2026). It was verified against eight prices
 * on their live site — $340.00 x 49.6759 = 16.889,81 TL, which is what the
 * site showed to the kuruş.
 */
export const FALLBACK_RATES: ExchangeRates = {
  USD: 49.6759,
  EUR: 51.7616,
  TRY: 1,
  asOf: "2026-10-22",
  // Kept short: this string is printed inside a sentence on the product page.
  source: "yedek kur",
};

let cached: ExchangeRates = FALLBACK_RATES;
let inFlight: Promise<ExchangeRates> | null = null;

/** Reads one currency's Döviz Satış figure out of TCMB's XML. */
function parseRate(xml: string, code: "USD" | "EUR"): number | undefined {
  // The document is small and its shape is stable, so a scoped regex beats
  // pulling in an XML parser for two numbers.
  const block = new RegExp(`<Currency[^>]*CurrencyCode="${code}"[^>]*>([\\s\\S]*?)</Currency>`).exec(xml);
  if (!block) return undefined;

  const unit = Number(/<Unit>([\d.,]+)<\/Unit>/.exec(block[1])?.[1] ?? "1");
  // ForexSelling is the Döviz Satış rate — the one a business converts at.
  const selling = Number(
    (/<ForexSelling>([\d.,]+)<\/ForexSelling>/.exec(block[1])?.[1] ?? "").replace(",", "."),
  );

  if (!Number.isFinite(selling) || selling <= 0) return undefined;
  if (!Number.isFinite(unit) || unit <= 0) return selling;
  return selling / unit;
}

function parseDate(xml: string): string | undefined {
  // Tarih="19.11.2026" → 2026-11-19
  const raw = /Tarih="(\d{2})\.(\d{2})\.(\d{4})"/.exec(xml);
  return raw ? `${raw[3]}-${raw[2]}-${raw[1]}` : undefined;
}

/**
 * Fetches and caches the TCMB rates.
 *
 * Concurrent callers share one request. On any failure the previous value is
 * kept and the error is logged — a bad rate would misprice the entire
 * catalogue, so stale-but-known beats fresh-but-wrong.
 */
export async function refreshRates(): Promise<ExchangeRates> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const response = await fetch(TCMB_URL, {
        headers: { Accept: "application/xml" },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`TCMB responded ${response.status}`);

      const xml = await response.text();
      const usd = parseRate(xml, "USD");
      if (!usd) throw new Error("USD rate missing from TCMB response");

      cached = {
        USD: usd,
        EUR: parseRate(xml, "EUR") ?? cached.EUR,
        TRY: 1,
        asOf: parseDate(xml) ?? new Date().toISOString().slice(0, 10),
        source: "TCMB Döviz Satış kuru",
      };
    } catch (error) {
      // Keep whatever we had. Log loudly — a rate stuck on the fallback for
      // days means every price on the site is wrong by however much the lira
      // has moved since — but log the message only: a DOMException prints its
      // entire constant table and buries every other line in the output.
      const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      console.error(`[kur] TCMB kuru alınamadı (${reason}). Önceki kur kullanılıyor: ${cached.USD} (${cached.source}).`);
    } finally {
      inFlight = null;
    }
    return cached;
  })();

  return inFlight;
}

/**
 * The rate to price with, read synchronously.
 *
 * Deliberately pure: no clock, no I/O, no side effects. It is called from
 * inside React renders, where reading the current time is a prerender error
 * under Cache Components and where kicking off a fetch would make the same
 * render return different numbers on a retry. Keeping it to a single property
 * read is what lets every price on the site be computed inline.
 */
export function getRates(): ExchangeRates {
  return cached;
}

/**
 * Starts the background refresh. Server only, once per process.
 *
 * Skipped during `next build`: a fetch started inside a prerender worker is
 * aborted the moment that prerender finishes, so it logs a failure, wastes a
 * request per worker, and could never have helped anyway — build-time pages
 * are not where the live rate belongs (see the `connection()` calls on the
 * price-bearing routes).
 *
 * `unref()` matters: without it the interval keeps the Node process alive and
 * a CLI build or a test run never exits.
 */
function startRefreshTimer(): void {
  if (typeof window !== "undefined") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  void refreshRates();

  const timer = setInterval(() => void refreshRates(), TTL_MS);
  if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
}

startRefreshTimer();

/** True while prices are still being computed from the hard-coded fallback. */
export function isUsingFallbackRate(): boolean {
  return cached === FALLBACK_RATES;
}
