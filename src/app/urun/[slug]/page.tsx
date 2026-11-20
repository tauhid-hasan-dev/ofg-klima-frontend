import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Breadcrumb, type Crumb } from "@/components/commerce/Breadcrumb";
import { ProductGrid } from "@/components/commerce/ProductCard";
import { PriceBlock, Rating, StockBadge, StockCount } from "@/components/commerce/ProductMeta";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductPurchasePanel } from "@/components/commerce/ProductPurchasePanel";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ClockIcon, ShieldIcon, TruckIcon } from "@/components/ui/icons";
import { getRates, usdToTry } from "@/lib/currency";
import { formatDate, formatNumber } from "@/lib/format";
import {
  getAllProductSlugs,
  getBrand,
  getBrandsWithCounts,
  getCategory,
  getCategoryTrail,
  getProduct,
  getRelatedProducts,
} from "@/lib/repository";
import { site } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Ürün bulunamadı" };

  const brand = await getBrand(product.brandSlug);

  return {
    title: `${product.name} | ${product.oem}`,
    description: `${product.name}. Ürün kodu ${product.oem}. ${brand?.name ?? ""} ${
      product.vehicles.length ? `Uyumlu araçlar: ${product.vehicles.join(", ")}.` : ""
    } Güncel fiyat ve stok bilgisi ${site.name}'da.`.replace(/\s+/g, " ").trim(),
    alternates: { canonical: `/urun/${product.slug}` },
    openGraph: { title: product.name, url: `/urun/${product.slug}`, images: [product.images[0]] },
  };
}

const STOCK_AVAILABILITY: Record<string, string> = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  on_order: "https://schema.org/PreOrder",
  out_of_stock: "https://schema.org/OutOfStock",
};

async function ProductContent({ params }: PageProps) {
  /*
   * Request-time, deliberately.
   *
   * Prices are USD converted at the current TCMB rate (requirement 10). A
   * prerendered product page would bake whatever the rate was at build time
   * and then show that number until the next deploy — which is exactly the
   * stale-TL-column failure the pricing design exists to avoid. The shell
   * around this boundary still prerenders, so the page paints immediately and
   * the priced body streams in.
   */
  await connection();

  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [brand, category, related, allBrands] = await Promise.all([
    getBrand(product.brandSlug),
    getCategory(product.categorySlug),
    getRelatedProducts(product),
    getBrandsWithCounts(),
  ]);

  const brandNames = Object.fromEntries(allBrands.map((item) => [item.slug, item.name]));
  const trail = category ? await getCategoryTrail(category.slug) : [];

  // Read once per render so the buy box, the structured data and the rate
  // footnote all quote the same figure even if TCMB refreshes mid-request.
  const rates = getRates();

  const crumbs: Crumb[] = [
    ...trail.map((item) => ({ label: item.name, href: `/kategori/${item.slug}` })),
    { label: product.name },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    mpn: product.oem,
    image: product.images.map((img) => `${site.url}${img}`),
    description: `${product.name}. Ürün kodu: ${product.oem}.`,
    brand: { "@type": "Brand", name: brand?.name ?? product.brandSlug },
    offers: {
      "@type": "Offer",
      url: `${site.url}/urun/${product.slug}`,
      priceCurrency: "TRY",
      price: usdToTry(product.priceUsd, rates).toFixed(2),
      availability: STOCK_AVAILABILITY[product.stock],
      seller: { "@type": "Organization", name: site.legalName },
    },
    ...(product.rating && product.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <Breadcrumb items={crumbs} />

      <div
        // Scopes the analytics tracker's product view and any WhatsApp
        // hand-off from this page to this product (requirement 16).
        data-product-id={product.id}
        data-product-name={product.name}
        className="grid gap-8 pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12"
      >
        {/* Media */}
        <ProductGallery images={product.images} alt={product.name} />

        {/* Buy box */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {brand ? (
              <Link
                href={`/marka/${brand.slug}`}
                className="rounded bg-navy-900 px-2 py-1 text-xs font-bold tracking-wide text-brand-400 uppercase"
              >
                {brand.name}
              </Link>
            ) : null}
            {product.isBestSeller ? (
              <span className="rounded bg-brand-500 px-2 py-1 text-xs font-bold text-white uppercase">
                Çok satan
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 font-display text-xl leading-tight font-extrabold tracking-tight text-ink-950 sm:text-2xl">
            {product.name}
          </h1>

          <div className="mt-3">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>

          <div className="mt-5 rounded-card bg-ink-50 p-5 ring-1 ring-ink-200">
            <PriceBlock priceUsd={product.priceUsd} listPriceUsd={product.listPriceUsd} size="lg" />
            {/* The rate is disclosed even though the dollar figure is not:
                prices move with the lira, and a customer who sees yesterday's
                price change should be able to see why. */}
            <p className="mt-1.5 text-xs text-ink-500">
              KDV dahildir. Fiyatlarımız {rates.source} ile güncellenir —{" "}
              <span className="tabular">1 USD = {formatNumber(rates.USD, 4)} TL</span>,{" "}
              <span className="tabular">{formatDate(rates.asOf)}</span>.
            </p>

            <div className="mt-5">
              <ProductPurchasePanel product={product} priceTry={usdToTry(product.priceUsd, rates)} />
            </div>
          </div>

          {/* Identification block — mirrors the client's product page, which
              lists Stok Kodu / Barkod / Stok as a plain labelled table. The
              stock figure is a number, not just a badge: trade buyers decide
              order quantity from it. */}
          <dl className="mt-5 divide-y divide-ink-200 overflow-hidden rounded-card ring-1 ring-ink-200">
            <div className="flex items-baseline gap-4 bg-white px-4 py-2.5 text-sm">
              <dt className="w-28 shrink-0 text-ink-500">Stok Kodu</dt>
              <dd className="font-mono text-[0.82rem] font-semibold text-ink-900 tabular">{product.sku}</dd>
            </div>
            <div className="flex items-baseline gap-4 bg-white px-4 py-2.5 text-sm">
              <dt className="w-28 shrink-0 text-ink-500">Ürün Kodu</dt>
              <dd className="font-mono text-[0.82rem] text-ink-900 tabular">{product.oem}</dd>
            </div>
            <div className="flex items-baseline gap-4 bg-white px-4 py-2.5 text-sm">
              <dt className="w-28 shrink-0 text-ink-500">Barkod</dt>
              <dd className="font-mono text-[0.82rem] text-ink-700 tabular">{product.barcode ?? "—"}</dd>
            </div>
            <div className="flex items-baseline gap-4 bg-white px-4 py-2.5 text-sm">
              <dt className="w-28 shrink-0 text-ink-500">Stok</dt>
              <dd className="flex items-center gap-3">
                <StockCount quantity={product.stockQuantity} />
                <StockBadge status={product.stock} />
              </dd>
            </div>
          </dl>

          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { Icon: TruckIcon, title: "Aynı gün kargo", text: "16:00'a kadar" },
              { Icon: ShieldIcon, title: "Garantili", text: "Faturalı satış" },
              { Icon: ClockIcon, title: "14 gün", text: "İade hakkı" },
            ].map(({ Icon, title, text }) => (
              <li key={title} className="flex items-center gap-2.5 rounded-md border border-ink-200 px-3 py-2.5">
                <Icon className="h-5 w-5 shrink-0 text-ink-950" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-900">{title}</span>
                  <span className="block text-xs text-ink-500">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Specs + fitment */}
      <div className="grid gap-6 pb-12 lg:grid-cols-2">
        <section>
          <SectionHeading title="Teknik Özellikler" />
          <dl className="overflow-hidden rounded-card ring-1 ring-ink-200">
            {product.specs.map((spec, index) => (
              <div
                key={spec.label}
                className={`flex items-baseline gap-4 px-4 py-3 text-sm ${index % 2 === 0 ? "bg-white" : "bg-ink-50"}`}
              >
                <dt className="w-44 shrink-0 text-ink-500">{spec.label}</dt>
                <dd className="font-medium text-ink-900">{spec.value}</dd>
              </div>
            ))}
            <div className="flex items-baseline gap-4 bg-white px-4 py-3 text-sm">
              <dt className="w-44 shrink-0 text-ink-500">Listeye Eklenme</dt>
              <dd className="font-medium text-ink-900">{formatDate(product.createdAt)}</dd>
            </div>
          </dl>
        </section>

        <section>
          <SectionHeading title="Uyumlu Araçlar" />
          <div className="rounded-card p-4 ring-1 ring-ink-200">
            <ul className="space-y-2">
              {product.vehicles.map((vehicle) => (
                <li key={vehicle} className="flex items-start gap-2.5 text-sm text-ink-800">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {vehicle}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-ink-200 pt-3 text-xs leading-relaxed text-ink-500">
              Uyumluluk listesi bilgi amaçlıdır. Siparişten önce aracınızın şasi numarası ve mevcut parça kodu ile
              teyit almanızı öneririz — WhatsApp hattımızdan dakikalar içinde doğrulayabiliriz.
            </p>
          </div>
        </section>
      </div>

      {related.length > 0 ? (
        <section className="pb-16">
          <SectionHeading title="Benzer Ürünler" />
          <ProductGrid products={related.slice(0, 8)} brandNames={brandNames} />
        </section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

/** `params` behind Suspense — see the note in /marka/[slug]/page.tsx. */
export default function ProductPage({ params }: PageProps) {
  return (
    <Container>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </Container>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="py-4">
        <div className="h-4 w-64 rounded bg-ink-100" />
      </div>
      <div className="grid gap-8 pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
        <div className="aspect-square rounded-card bg-ink-100" />
        <div className="space-y-4">
          <div className="h-6 w-24 rounded bg-ink-200" />
          <div className="h-7 w-full rounded bg-ink-200" />
          <div className="h-7 w-2/3 rounded bg-ink-200" />
          <div className="h-4 w-48 rounded bg-ink-100" />
          <div className="h-44 rounded-card bg-ink-100" />
        </div>
      </div>
    </div>
  );
}
