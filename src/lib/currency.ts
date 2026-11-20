/**
 * Dual-currency pricing.
 *
 * The business holds list prices in **USD** and shows the TL equivalent
 * computed at the current rate — this was read directly off the client's live
 * site and verified against eight observed prices:
 *
 *   $340.00 x 49.6759 = 16.889,81 TL   (site showed 16.889,81 TL)
 *   $42.50  x 49.6759 =  2.111,23 TL   (site showed  2.111,23 TL)
 *
 * The live rate now comes from TCMB (requirement 10) — see
 * `src/lib/exchange-rate.ts`, which owns fetching, caching and the fallback.
 * This module only does the arithmetic, so `buildPrice` stays a pure function
 * of (price, rate). Consequences that matter:
 *
 *   - TL is NEVER stored. It is derived on every render. A frozen TL column
 *     goes stale the moment the rate moves, and this trade reprices daily.
 *   - USD is the source of truth for sorting, filtering and price ranges, so
 *     a rate change can't reorder the catalogue.
 *   - The USD shown is the retail figure, i.e. after the category markup in
 *     `src/lib/pricing.ts`. Both currencies derive from the same number, so
 *     they can never disagree.
 */

import { getRates } from "@/lib/exchange-rate";

export { getRates, FALLBACK_RATES as RATES } from "@/lib/exchange-rate";

export type CurrencyCode = "USD" | "TRY" | "EUR";

export interface ExchangeRates {
  /** TL per 1 unit of the currency. TRY is 1 by definition. */
  USD: number;
  EUR: number;
  TRY: 1;
  /** When the rates were captured; shown to the user so the number is accountable. */
  asOf: string;
  source: string;
}

/** Converts a USD amount to TL at the current rate. */
export function usdToTry(usd: number, rates: ExchangeRates = getRates()): number {
  return usd * rates.USD;
}

export interface DualPrice {
  usd: number;
  try: number;
  /** Pre-discount prices, when the product is on offer. */
  listUsd?: number;
  listTry?: number;
  /** Whole-percent discount, floored so we never overstate it. */
  discountPercent?: number;
}

/**
 * Builds the pair of prices a product card or buy box renders.
 *
 * The discount percentage is computed from USD, not TL: they are the same ratio
 * mathematically, but deriving it from the stored currency avoids a rounding
 * drift that would otherwise show "%19" next to USD and "%20" next to TL.
 */
export function buildPrice(
  priceUsd: number,
  listPriceUsd?: number,
  rates: ExchangeRates = getRates(),
): DualPrice {
  const hasDiscount = typeof listPriceUsd === "number" && listPriceUsd > priceUsd;

  return {
    usd: priceUsd,
    try: usdToTry(priceUsd, rates),
    listUsd: hasDiscount ? listPriceUsd : undefined,
    listTry: hasDiscount ? usdToTry(listPriceUsd, rates) : undefined,
    discountPercent: hasDiscount
      ? Math.floor(((listPriceUsd - priceUsd) / listPriceUsd) * 100)
      : undefined,
  };
}
