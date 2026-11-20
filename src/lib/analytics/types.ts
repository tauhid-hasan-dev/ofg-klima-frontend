/**
 * Site analytics — requirement 16.
 *
 * The client wants, in their words: which words visitors searched and how
 * often ("kasnak" yerine "kanak" yazanları da görebilmek istiyorum), a ranking
 * of visits, day-by-day activity, how many people went to WhatsApp after
 * looking at a given product, and a map of Türkiye shaded by where visits come
 * from.
 *
 * ## What is deliberately NOT stored
 *
 * No names, no IP addresses, no cookies, no cross-session identifier. The
 * client raised KVKK themselves and noted the site has no sign-in anyway. Each
 * event carries only: what happened, to which product or search term, from
 * which city (resolved at the edge and never kept in raw form), and when.
 *
 * That is enough to answer every question on their list, and it means the
 * store holds no personal data to leak, export or delete.
 */

export type AnalyticsEventType =
  /** A page was viewed. `path` carries which one. */
  | "page_view"
  /** A search was run. `term` is what was typed, verbatim including typos. */
  | "search"
  /** A product detail page was opened. */
  | "product_view"
  /** A WhatsApp link was followed, optionally from a product. */
  | "whatsapp";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  /** ISO timestamp, second precision — minute-level detail is not needed. */
  at: string;
  path?: string;
  /** Search term exactly as typed. Misspellings are the point, not noise. */
  term?: string;
  /** Product id for product_view and product-originated whatsapp events. */
  productId?: string;
  productName?: string;
  /** City resolved from edge geo headers. "Bilinmiyor" when unavailable. */
  city?: string;
}

/** What the dashboard renders. Everything is a count; nothing is a person. */
export interface AnalyticsSummary {
  range: { from: string; to: string; days: number };
  totals: {
    pageViews: number;
    searches: number;
    productViews: number;
    whatsapp: number;
  };
  /** Most-searched terms, highest first — requirement 16's headline ask. */
  topSearches: Array<{ term: string; count: number }>;
  /** Searches that returned nothing: the catalogue gaps worth filling. */
  topProducts: Array<{ productId: string; productName: string; views: number; whatsapp: number }>;
  /** Visits per day, oldest first, for the activity chart. */
  daily: Array<{ date: string; pageViews: number; searches: number; whatsapp: number }>;
  /** Visits per city, highest first — the data behind the density map. */
  cities: Array<{ city: string; visits: number }>;
}
