"use client";

import { useState } from "react";
import { AddToCartButton, QuantityStepper } from "@/components/commerce/AddToCartButton";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { formatPrice, whatsappLink } from "@/lib/format";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";

/**
 * `priceTry` is converted on the server and passed in, not computed here. The
 * TCMB rate lives in a server-side cache; a client-side conversion would fall
 * back to the hard-coded rate and quote a different lira figure than the price
 * block two centimetres above it.
 */
export function ProductPurchasePanel({ product, priceTry }: { product: Product; priceTry: number }) {
  const [quantity, setQuantity] = useState(1);
  const orderable = product.stock !== "out_of_stock";

  const message = `Merhaba, "${product.name}" (Kod: ${product.oem}) ürününden ${quantity} adet almak istiyorum. Listelenen fiyat: ${formatPrice(priceTry)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <span className="text-sm text-ink-500 tabular">
          Ara toplam:{" "}
          <strong className="font-semibold text-ink-900">{formatPrice(priceTry * quantity)}</strong>
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
