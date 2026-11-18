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
 * The rate is the "Serbest Piyasa Satış" (free-market sell) figure from their
 * ERP dashboard. Consequences that matter:
 *
 *   - TL is NEVER stored. It is derived on every render. A frozen TL column
 *     goes stale the moment the rate moves, and this trade reprices daily.
 *   - USD is the source of truth for sorting, filtering and price ranges, so
 *     a rate change can't reorder the catalogue.
 */

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

/**
 * Snapshot from the client's admin panel (Döviz Kurları, 22.10.2026).
 *
 * Replace this with a live read once the backend exists — the ERP already
 * exposes these figures. Keep the shape identical so nothing else changes.
 */
export const RATES: ExchangeRates = {
  USD: 49.6759,
  EUR: 51.7616,
  TRY: 1,
  asOf: "2026-10-22",
  source: "Serbest Piyasa Satış",
};

/** Converts a USD amount to TL at the current rate. */
export function usdToTry(usd: number, rates: ExchangeRates = RATES): number {
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
  rates: ExchangeRates = RATES,
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
