"use client";

import { useState } from "react";
import { AddToCartButton, QuantityStepper } from "@/components/commerce/AddToCartButton";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { usdToTry } from "@/lib/currency";
import { formatPrice, formatUsd, whatsappLink } from "@/lib/format";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const orderable = product.stock !== "out_of_stock";

  const message = `Merhaba, "${product.name}" (Kod: ${product.oem}) ürününden ${quantity} adet almak istiyorum. Listelenen fiyat: ${formatUsd(product.priceUsd)} / ${formatPrice(usdToTry(product.priceUsd))}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <span className="text-sm text-ink-500 tabular">
          Ara toplam:{" "}
          <strong className="font-semibold text-ink-900">{formatUsd(product.priceUsd * quantity)} · {formatPrice(usdToTry(product.priceUsd * quantity))}</strong>
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <AddToCartButton
          productId={product.id}
          quantity={quantity}
          disabled={!orderable}
          size="lg"
          label={orderable ? "Sepete Ekle" : "Tükendi"}
        />
        <ButtonLink href={whatsappLink(site.whatsapp, message)} external variant="whatsapp" size="lg" fullWidth>
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp İletişim
        </ButtonLink>
      </div>
    </div>
  );
}
