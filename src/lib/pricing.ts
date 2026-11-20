import { categories } from "@/lib/data/categories";
import type { Product } from "@/lib/types";

/**
 * Category-based retail markup — requirement 9.
 *
 * DIA holds the trade price (the "Fiyat 6" column, in USD). The public site is
 * aimed at end users and must show a higher figure, by a percentage the client
 * sets per category. Their worked example:
 *
 *     21.112,26 TL in DIA  →  25.000 TL on the site     (+18.4%)
 *
 * Two consequences the client called out explicitly:
 *
 *  - The uplift is a property of the *category*, not the product. A newly
 *    imported part already has its grup kodu, so it is priced correctly the
 *    moment it lands — nobody touches it by hand (requirement 15).
 *  - Trade customers keep buying at the DIA price through the B2B portal. The
 *    retail figure here is what makes their dealer discount visible.
 *
 * The markup is applied in **USD, before conversion**, so the dollar and lira
 * figures on a product card always agree — the site shows both, and a markup
 * applied only to the lira side would make them contradict each other.
 */

/**
 * Used where a category sets no rate of its own and has no parent that does.
 * Derived from the client's example above, rounded to a whole percent.
 *
 * The real per-category table comes from the client ("kategorilere göre oran
 * müşteri verecek"). Until then these are placeholders — edit `markupPercent`
 * in `src/lib/data/categories.ts`, which is the only place they live.
 */
export const DEFAULT_MARKUP_PERCENT = 18;

const BY_SLUG = new Map(categories.map((category) => [category.slug, category]));

/**
 * The markup for a category, inherited from its parent when it sets none.
 *
 * Inheritance keeps the table short: set 25% on "Kompresör Yedek Parça" and
 * every kasnak, bobin and plaka under it follows, including ones added later.
 */
export function markupPercentFor(categorySlug: string | undefined): number {
  let current = categorySlug ? BY_SLUG.get(categorySlug) : undefined;

  // Depth is 2 today; the guard is for a deeper tree, and for the cycle a
  // hand-edited parent slug could otherwise introduce.
  for (let depth = 0; current && depth < 8; depth += 1) {
    if (typeof current.markupPercent === "number") return current.markupPercent;
    current = current.parent ? BY_SLUG.get(current.parent) : undefined;
  }

  return DEFAULT_MARKUP_PERCENT;
}

/** Multiplier form, e.g. 18 → 1.18. */
export function markupFactorFor(categorySlug: string | undefined): number {
  return 1 + markupPercentFor(categorySlug) / 100;
}

/** Rounds to cents, so the derived lira figure never carries phantom precision. */
function toCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Turns a trade-priced product into the retail-priced one the site shows.
 *
 * `costPriceUsd` keeps the original DIA figure so the admin can still see what
 * a part actually costs, and so the markup is never applied twice — importing
 * the same product again starts from the cost price, not from the marked-up
 * one.
 */
export function applyMarkup(product: Product): Product {
  const factor = markupFactorFor(product.categorySlug);
  const cost = product.costPriceUsd ?? product.priceUsd;
  const listCost = product.listPriceUsd;

  return {
    ...product,
    costPriceUsd: cost,
    priceUsd: toCents(cost * factor),
    listPriceUsd: typeof listCost === "number" ? toCents(listCost * factor) : undefined,
  };
}
