import Image from "next/image";
import Link from "next/link";
import { AddToCartButton, CardQuantityAdd } from "@/components/commerce/AddToCartButton";
import { PriceBlock, Rating, StockBadge, isOrderable } from "@/components/commerce/ProductMeta";
import { WhatsAppIcon } from "@/components/ui/icons";
import { usdToTry } from "@/lib/currency";
import { formatPrice, whatsappLink } from "@/lib/format";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";
import { clsx } from "@/lib/utils";

export type CardLayout = "grid" | "list";

function enquiryLink(product: Product): string {
  return whatsappLink(
    site.whatsapp,
    `Merhaba, "${product.name}" (Kod: ${product.oem}) ürünü hakkında bilgi almak istiyorum. Listelenen fiyat: ${formatPrice(usdToTry(product.priceUsd))}`,
  );
}

export function ProductCard({
  product,
  brandName,
  layout = "grid",
  priority = false,
}: {
  product: Product;
  brandName: string;
  layout?: CardLayout;
  priority?: boolean;
}) {
  const href = `/urun/${product.slug}`;
  const orderable = isOrderable(product.stock);

  if (layout === "list") {
    return (
      <article className="group flex gap-4 rounded-card bg-white p-4 shadow-card ring-1 ring-ink-200/70 transition-shadow hover:shadow-card-hover sm:gap-6">
        <Link href={href} className="relative block w-28 shrink-0 self-start sm:w-40" tabIndex={-1} aria-hidden="true">
          <div className="aspect-square overflow-hidden rounded-md bg-ink-50">
            <Image
              src={product.images[0]}
              alt=""
              width={400}
              height={400}
              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
            />
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/marka/${product.brandSlug}`}
              className="text-xs font-bold tracking-wide text-ink-500 uppercase transition-colors hover:text-ink-900"
            >
              {brandName}
            </Link>
            <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[0.68rem] font-medium text-ink-700 tabular">
              {product.oem}
            </code>
            {product.isBestSeller ? (
              <span className="rounded bg-brand-400 px-1.5 py-0.5 text-[0.65rem] font-bold text-ink-950 uppercase">
                Çok satan
              </span>
            ) : null}
          </div>

          <h3 className="text-[0.95rem] leading-snug font-semibold text-ink-900">
            <Link href={href} className="transition-colors hover:text-ink-600">
              {product.name}
            </Link>
          </h3>

          {product.vehicles.length > 0 ? (
            <p className="truncate text-xs text-ink-500">{product.vehicles.join(" · ")}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Rating value={product.rating} count={product.reviewCount} />
            <StockBadge status={product.stock} />
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
            <PriceBlock priceUsd={product.priceUsd} listPriceUsd={product.listPriceUsd} />
            <div className="flex items-center gap-2">
              <a
                href={enquiryLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-whatsapp px-3 text-sm font-semibold text-whatsapp-dark transition-colors hover:bg-whatsapp hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Bilgi Al</span>
              </a>
              <AddToCartButton productId={product.id} disabled={!orderable} size="sm" fullWidth={false} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card ring-1 ring-ink-200/70 transition-shadow hover:shadow-card-hover">
      <Link href={href} className="relative block" tabIndex={-1} aria-hidden="true">
        <div className="aspect-square overflow-hidden bg-ink-50">
          <Image
            src={product.images[0]}
            alt=""
            width={400}
            height={400}
            priority={priority}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
            className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.06]"
          />
        </div>

        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {product.isBestSeller ? (
            <span className="rounded bg-brand-400 px-1.5 py-0.5 text-[0.65rem] font-bold text-ink-950 uppercase">
              Çok satan
            </span>
          ) : null}
          {product.stock === "low_stock" ? (
            <span className="rounded bg-stock-low px-1.5 py-0.5 text-[0.65rem] font-bold text-white uppercase">
              Son adetler
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Link
            href={`/marka/${product.brandSlug}`}
            className="truncate text-xs font-bold tracking-wide text-ink-500 uppercase transition-colors hover:text-ink-900"
          >
            {brandName}
          </Link>
          {/* Long OEM codes must be allowed to truncate — at 320px two cards
              plus a non-shrinking chip push the grid past the viewport. */}
          <code
            title={product.oem}
            className="max-w-[60%] truncate rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[0.65rem] font-medium text-ink-700 tabular"
          >
            {product.oem}
          </code>
        </div>

        {/* No min-height: it would have to be an exact multiple of the line
            height or a sliver of the clipped third line shows through. Card
            footers are bottom-aligned via `mt-auto`, so uneven title heights
            do not misalign the grid. */}
        <h3 className="line-clamp-2 text-[0.9rem] leading-snug font-semibold text-ink-900">
          <Link href={href} className="transition-colors hover:text-ink-600">
            {product.name}
          </Link>
        </h3>

        <Rating value={product.rating} count={product.reviewCount} />

        <div className="mt-auto space-y-2.5 pt-2">
          <PriceBlock priceUsd={product.priceUsd} listPriceUsd={product.listPriceUsd} />
          <StockBadge status={product.stock} />

          {/* Quantity is set on the card itself — see CardQuantityAdd. The
              per-card WhatsApp button was dropped with it: three controls do
              not fit a 130px-wide card at 320px, and WhatsApp remains on the
              product page, the header and the floating button. */}
          <CardQuantityAdd productId={product.id} disabled={!orderable} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  brandNames,
  layout = "grid",
  columns = 4,
}: {
  products: Product[];
  brandNames: Record<string, string>;
  layout?: CardLayout;
  columns?: 2 | 3 | 4;
}) {
  if (layout === "list") {
    return (
      <div className="flex flex-col gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            brandName={brandNames[product.brandSlug] ?? product.brandSlug}
            layout="list"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "grid gap-3 sm:gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          brandName={brandNames[product.brandSlug] ?? product.brandSlug}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
