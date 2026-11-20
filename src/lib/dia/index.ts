import { brands } from "@/lib/data/brands";
import { resolveGroupCode } from "@/lib/data/dia-group-codes";
import { partFamily, slugify } from "@/lib/data/products";
import { applyMarkup } from "@/lib/pricing";
import type { Product, StockStatus } from "@/lib/types";

/**
 * DIA import boundary — requirements 14 and 15.
 *
 * ## Status: contract only, not wired up
 *
 * There is no DIA access yet, so `createDiaClient()` throws unless credentials
 * are configured. Everything downstream of the client — the field mapping, the
 * group-code lookup, the markup, the USD→TL conversion — is implemented and
 * exercised by `mapStockCard()`, so connecting the real endpoint is a matter of
 * filling in one function rather than building the pipeline.
 *
 * ## The fields
 *
 * The brief names exactly what the API pulls (page 9, item 14):
 *
 *   stok kodu / açıklama / grup kodu / marka / fiyat 6 / not
 *
 * which map to `DiaStockCard` below. Two of them carry more weight than they
 * look:
 *
 *  - **grup kodu** decides the website category *and*, through it, the retail
 *    markup. See `src/lib/data/dia-group-codes.ts`.
 *  - **fiyat 6** is the USD figure on the ERP's price card (the screenshot
 *    shows Fiyat 6 = 400,00 with the currency dropdown set to USD). It is the
 *    trade price — the cost basis, never shown to a retail shopper.
 *
 * ## Requirement 15 falls out of this
 *
 * "A product added to DIA shows up on our site under new arrivals, converted
 * to TL and marked up by its category percentage." Nothing special implements
 * that: `mapStockCard` sets `createdAt`, `applyMarkup` prices it from its grup
 * kodu, and the TL figure is derived at render from the TCMB rate. Import the
 * card and the rest already works.
 */

/** A stock card as DIA hands it over. Field names mirror the ERP's own. */
export interface DiaStockCard {
  /** "Stok Kodu", e.g. OFG-21025-ORJ. The stable identity of a part. */
  stokKodu: string;
  /** "Açıklama" — the long description that becomes the product name. */
  aciklama: string;
  /** "Grup Kodu", e.g. KOMPRESÖRLER. Decides category and markup. */
  grupKodu?: string;
  /** "Marka", e.g. PEUGEOT. */
  marka?: string;
  /** "Fiyat 6" in USD — the trade price, before the retail markup. */
  fiyat6: number;
  /** "Not" — free text from the ERP's Not tab. Shown as a product note. */
  not?: string;

  /* Fields DIA also exposes that the storefront needs but the brief did not
     spell out. All optional, all degrade to a sensible default. */
  barkod?: string;
  /** Units on hand. Absent means "unknown", which is not the same as zero. */
  stokMiktari?: number;
  /** ISO date the card was created, used for "Yeni Ürünler" ordering. */
  olusturmaTarihi?: string;
}

export interface DiaClientConfig {
  /** DIA web-service base URL, e.g. https://ofgotoklima.ws.dia.com.tr/api/v3 */
  baseUrl: string;
  apiKey: string;
  /** DIA "firma kodu" — OFG OTO LTD in the recording. */
  firmaKodu: string;
  /** Depot to read stock levels from, e.g. "2-OFG OTO LTD - MRKZ01". */
  depo?: string;
}

export interface DiaClient {
  /** Every stock card, for a full rebuild of the catalogue. */
  listStockCards(): Promise<DiaStockCard[]>;
  /** Cards changed since a timestamp, for the incremental sync. */
  listStockCardsSince(since: Date): Promise<DiaStockCard[]>;
}

export class DiaNotConfiguredError extends Error {
  constructor() {
    super(
      "DIA erişimi yapılandırılmamış. DIA_BASE_URL, DIA_API_KEY ve DIA_FIRMA_KODU " +
        "ortam değişkenlerini tanımlayın.",
    );
    this.name = "DiaNotConfiguredError";
  }
}

/** Reads the configuration from the environment, or returns null if absent. */
export function readDiaConfig(): DiaClientConfig | null {
  const baseUrl = process.env.DIA_BASE_URL;
  const apiKey = process.env.DIA_API_KEY;
  const firmaKodu = process.env.DIA_FIRMA_KODU;

  if (!baseUrl || !apiKey || !firmaKodu) return null;
  return { baseUrl, apiKey, firmaKodu, depo: process.env.DIA_DEPO };
}

/**
 * Builds the live client.
 *
 * Deliberately unimplemented: writing a request body against an API nobody has
 * seen would produce code that looks finished and fails on first contact. The
 * shape above is what the rest of the pipeline consumes; fill these two
 * methods in once the endpoint and its response are known.
 */
export function createDiaClient(config: DiaClientConfig | null = readDiaConfig()): DiaClient {
  if (!config) throw new DiaNotConfiguredError();

  throw new Error(
    "DIA istemcisi henüz uygulanmadı. Erişim bilgileri geldiğinde " +
      "listStockCards/listStockCardsSince metodlarını doldurun; " +
      "mapStockCard() zinciri hazır.",
  );
}

/* ── Mapping ────────────────────────────────────────────────────────────── */

const BRAND_BY_NAME = new Map(brands.map((brand) => [brand.name.toLocaleLowerCase("tr"), brand.slug]));

/**
 * DIA's "Marka" column holds whatever was typed — "PEUGEOT", "Sanden",
 * "SANDEN ". Matched case-insensitively against the known brands; anything
 * unrecognised is slugified so the product still lands somewhere coherent
 * rather than being dropped.
 */
export function resolveBrand(marka: string | undefined): string {
  if (!marka) return "diger";
  const known = BRAND_BY_NAME.get(marka.trim().toLocaleLowerCase("tr"));
  return known ?? (slugify(marka) || "diger");
}

/**
 * Stock level → the badge the storefront shows.
 *
 * `undefined` means DIA did not report a quantity, which is not zero. Those
 * become "siparişe bağlı" rather than "tükendi" — telling a customer a part is
 * out of stock when we simply do not know loses the sale outright.
 */
export function resolveStock(quantity: number | undefined): StockStatus {
  if (quantity === undefined) return "on_order";
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= 3) return "low_stock";
  return "in_stock";
}

export interface MappedCard {
  product: Product;
  /** Set when the grup kodu matched nothing — park these for review. */
  unresolvedGroupCode?: string;
}

/**
 * Turns a DIA stock card into a storefront product, retail price included.
 *
 * A card whose grup kodu is unknown still produces a product, flagged via
 * `unresolvedGroupCode`, so the importer can queue it for a human instead of
 * filing it under a guessed category. Silently mis-filing a part is worse than
 * leaving it unassigned — nobody notices the first, everybody notices the
 * second.
 */
export function mapStockCard(card: DiaStockCard): MappedCard {
  const categorySlug = resolveGroupCode(card.grupKodu) ?? "siniflandirilmamis";
  const name = card.aciklama.trim() || card.stokKodu;
  const stock = resolveStock(card.stokMiktari);
  const family = partFamily(categorySlug);

  const base: Product = {
    id: card.stokKodu,
    slug: `${slugify(name).slice(0, 72).replace(/-+$/, "")}-${slugify(card.stokKodu)}`,
    name,
    brandSlug: resolveBrand(card.marka),
    categorySlug,
    // Parts are searched by their universal code; the stok kodu is the closest
    // thing DIA holds to one until a dedicated OEM field exists.
    oem: card.stokKodu,
    sku: card.stokKodu,
    barcode: card.barkod?.trim() || undefined,
    // fiyat6 is the trade price. applyMarkup promotes it to the retail figure
    // and keeps the original in costPriceUsd.
    priceUsd: card.fiyat6,
    stock,
    stockQuantity: Math.max(0, card.stokMiktari ?? 0),
    // Placeholder art for the resolved category until OFG's photography is
    // attached to the stock card. DIA has no image field in the brief.
    images: [1, 2, 3].map((view) => `/parts/${family}-${view}.svg`),
    vehicles: [],
    specs: [
      { label: "Stok Kodu", value: card.stokKodu },
      ...(card.not?.trim() ? [{ label: "Not", value: card.not.trim() }] : []),
    ],
    createdAt: (card.olusturmaTarihi ?? new Date().toISOString()).slice(0, 10),
  };

  return {
    product: applyMarkup(base),
    unresolvedGroupCode: categorySlug ? undefined : card.grupKodu,
  };
}

/** Maps a batch, separating the cards that need a human decision. */
export function mapStockCards(cards: DiaStockCard[]): {
  products: Product[];
  needsReview: Array<{ stokKodu: string; grupKodu?: string }>;
} {
  const products: Product[] = [];
  const needsReview: Array<{ stokKodu: string; grupKodu?: string }> = [];

  for (const card of cards) {
    const mapped = mapStockCard(card);
    products.push(mapped.product);
    if (mapped.unresolvedGroupCode !== undefined || !card.grupKodu) {
      needsReview.push({ stokKodu: card.stokKodu, grupKodu: card.grupKodu });
    }
  }

  return { products, needsReview };
}
