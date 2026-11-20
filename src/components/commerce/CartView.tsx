"use client";

import Image from "next/image";
import Link from "next/link";
import { QuantityStepper } from "@/components/commerce/AddToCartButton";
import { ButtonLink } from "@/components/ui/Button";
import { CartIcon, TrashIcon, WhatsAppIcon } from "@/components/ui/icons";
import { formatPrice, whatsappLink } from "@/lib/format";
import { site } from "@/lib/site";
import { useCart } from "@/lib/store/cart";

/** The subset of a product the cart needs — kept small because the whole map is serialised to the client. */
export interface CartProduct {
  id: string;
  slug: string;
  name: string;
  oem: string;
  priceUsd: number;
  /** Unit price in TL, already converted at the server's TCMB rate. */
  priceTry: number;
  image: string;
  brandName: string;
  orderable: boolean;
}

const FREE_SHIPPING_THRESHOLD = 7500;
const SHIPPING_FEE = 249;

export function CartView({ catalogue }: { catalogue: Record<string, CartProduct> }) {
  const { lines, ready, setQuantity, remove, clear } = useCart();

  // Until localStorage has been read the cart is unknowable — render a neutral
  // placeholder rather than an "empty cart" that may be wrong.
  if (!ready) {
    return (
      <div className="animate-pulse space-y-3 py-10" aria-hidden="true">
        <div className="h-24 rounded-card bg-ink-100" />
        <div className="h-24 rounded-card bg-ink-100" />
      </div>
    );
  }

  const items = lines
    .map((line) => ({ line, product: catalogue[line.productId] }))
    .filter((entry): entry is { line: typeof entry.line; product: CartProduct } => Boolean(entry.product));

  if (items.length === 0) {
    return (
      <div className="rounded-card bg-white px-6 py-16 text-center ring-1 ring-ink-200">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-100 text-ink-400">
          <CartIcon className="h-8 w-8" />
        </span>
        <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-ink-950">Sepetiniz boş</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">
          Kategorilere göz atarak ya da parça kodu ile arayarak ihtiyacınız olan ürünü bulabilirsiniz.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/kategori/klima-kompresoru">Kompresörleri İncele</ButtonLink>
          <ButtonLink href="/marka" variant="outline">
            Markalara Göz At
          </ButtonLink>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((total, { line, product }) => total + product.priceTry * line.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const orderSummary = items
    .map(({ line, product }) => `• ${product.name} (${product.oem}) × ${line.quantity}`)
    .join("\n");

  return (
    <div className="grid items-start gap-6 pb-16 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-3">
        {items.map(({ line, product }) => (
          <article key={product.id} className="flex gap-4 rounded-card bg-white p-4 ring-1 ring-ink-200">
            <Link href={`/urun/${product.slug}`} className="shrink-0">
              <div className="h-24 w-24 overflow-hidden rounded-md bg-ink-50">
                <Image
                  src={product.image}
                  alt=""
                  width={200}
                  height={200}
                  className="h-full w-full object-contain p-2"
                />
              </div>
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-xs font-bold tracking-wide text-ink-500 uppercase">{product.brandName}</span>
              <h3 className="text-sm leading-snug font-semibold text-ink-900">
                <Link href={`/urun/${product.slug}`} className="hover:underline">
                  {product.name}
                </Link>
              </h3>
              <code className="w-fit rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[0.68rem] text-ink-700 tabular">
                {product.oem}
              </code>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                <QuantityStepper
                  value={line.quantity}
                  onChange={(next) => setQuantity(product.id, next)}
                  label={product.oem}
                />
                <div className="flex items-center gap-4">
                  <span className="font-display text-lg font-extrabold text-ink-950 tabular">
                    {formatPrice(product.priceTry * line.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label={`${product.name} ürününü sepetten çıkar`}
                    className="grid h-9 w-9 place-items-center rounded-md text-ink-400 transition-colors hover:bg-signal-500/10 hover:text-signal-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={clear}
          className="text-sm font-semibold text-ink-500 underline underline-offset-2 transition-colors hover:text-signal-500"
        >
          Sepeti boşalt
        </button>
      </div>

      <aside className="sticky top-44 rounded-card bg-white p-5 ring-1 ring-ink-200">
        <h2 className="font-display text-base font-bold tracking-wide text-ink-950 uppercase">Sipariş Özeti</h2>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-600">Ara toplam</dt>
            <dd className="font-semibold text-ink-900 tabular">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-600">Kargo</dt>
            <dd className="font-semibold text-ink-900 tabular">
              {shipping === 0 ? <span className="text-stock-in">Ücretsiz</span> : formatPrice(shipping)}
            </dd>
          </div>
        </dl>

        {remaining > 0 ? (
          <p className="mt-3 rounded-md bg-brand-100 px-3 py-2 text-xs leading-relaxed text-ink-800">
            Ücretsiz kargo için sepetinize{" "}
            <strong className="font-bold tabular">{formatPrice(remaining)}</strong> daha ekleyin.
          </p>
        ) : null}

        <div className="mt-4 flex items-baseline justify-between border-t border-ink-200 pt-4">
          <span className="font-display text-sm font-bold tracking-wide text-ink-950 uppercase">Toplam</span>
          <span className="font-display text-2xl font-extrabold text-ink-950 tabular">
            {formatPrice(subtotal + shipping)}
          </span>
        </div>
        <p className="mt-1 text-right text-xs text-ink-500">KDV dahildir.</p>

        <div className="mt-5 space-y-2">
          {/* Checkout is intentionally a WhatsApp handoff until the backend and
              payment provider are in place — it is the channel this business
              already closes orders on. */}
          <ButtonLink
            href={whatsappLink(
              site.whatsapp,
              `Merhaba, aşağıdaki ürünler için sipariş vermek istiyorum:\n\n${orderSummary}\n\nToplam: ${formatPrice(subtotal + shipping)}`,
            )}
            external
            variant="whatsapp"
            size="lg"
            fullWidth
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp ile Sipariş Ver
          </ButtonLink>
          <ButtonLink href="/arama" variant="outline" fullWidth>
            Alışverişe Devam Et
          </ButtonLink>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-500">
          Online ödeme altyapısı kurulum aşamasındadır. Siparişinizi şimdilik WhatsApp üzerinden tamamlıyoruz;
          havale/EFT ve kredi kartı seçenekleri temsilcimiz tarafından iletilir.
        </p>
      </aside>
    </div>
  );
}
