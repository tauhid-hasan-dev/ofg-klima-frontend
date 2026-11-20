import type { Metadata } from "next";
import { Breadcrumb } from "@/components/commerce/Breadcrumb";
import { CartView, type CartProduct } from "@/components/commerce/CartView";
import { Container } from "@/components/ui/Container";
import { usdToTry } from "@/lib/currency";
import { getBrandsWithCounts, listProducts } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Sepetim",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  // The cart lives in localStorage, so the server cannot know which products to
  // fetch. Shipping a slim catalogue lets the client resolve ids without an API
  // call; once the backend exists this becomes a POST of the line ids instead.
  const [{ items }, brands] = await Promise.all([
    listProducts({ perPage: 10_000 }),
    getBrandsWithCounts(),
  ]);

  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));

  const catalogue: Record<string, CartProduct> = Object.fromEntries(
    items.map((product) => [
      product.id,
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        oem: product.oem,
        priceUsd: product.priceUsd,
        // Converted here rather than in the client: the TCMB rate lives on the
        // server (see src/lib/exchange-rate.ts), and a browser falling back to
        // the hard-coded rate would quietly show a different total than the
        // product page did.
        priceTry: usdToTry(product.priceUsd),
        image: product.images[0],
        brandName: brandNames.get(product.brandSlug) ?? product.brandSlug,
        orderable: product.stock !== "out_of_stock",
      } satisfies CartProduct,
    ]),
  );

  return (
    <Container>
      <Breadcrumb items={[{ label: "Sepetim" }]} />

      <h1 className="pb-6 font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
        Sepetim
      </h1>

      <CartView catalogue={catalogue} />
    </Container>
  );
}
