import Link from "next/link";
import { Container } from "@/components/ui/Container";

/**
 * Manufacturer strip under the hero — requirement 4.
 *
 * "banner altı sattığımız ürünlerin iconları görünmesi. ve ilgili icona
 * tıklandığında o markanın ürünleri görünmesi." The reference site runs a row
 * of supplier logos immediately below the banner; each one opens that brand's
 * listing.
 *
 * The logos themselves are wordmarks rather than images, because OFG has not
 * supplied the artwork. Each is set in the display face at a weight that lets
 * the row read as a logo wall rather than a list of links — and swapping a
 * real SVG in later is a one-line change per brand, with no layout work.
 */
export interface StripBrand {
  slug: string;
  name: string;
  productCount: number;
}

export function BrandStrip({ brands }: { brands: StripBrand[] }) {
  if (brands.length === 0) return null;

  return (
    <section aria-labelledby="marka-serisi" className="border-b border-ink-200 bg-ink-50">
      <Container>
        <h2 id="marka-serisi" className="sr-only">
          Sattığımız markalar
        </h2>

        {/*
          Scrolls horizontally rather than wrapping: a logo wall that reflows
          to two ragged rows stops reading as a wall. On a phone the overflow
          is the point — you swipe it.
        */}
        <ul className="scrollbar-none -mx-1 flex items-stretch gap-1 overflow-x-auto py-3">
          {brands.map((brand) => (
            <li key={brand.slug} className="shrink-0">
              <Link
                href={`/marka/${brand.slug}`}
                className="group flex h-16 min-w-[8.5rem] flex-col items-center justify-center rounded-md px-5 transition-colors hover:bg-white"
                title={`${brand.name} ürünleri`}
              >
                <span className="font-display text-base font-extrabold tracking-[0.06em] text-ink-400 uppercase transition-colors group-hover:text-brand-600">
                  {brand.name}
                </span>
                <span className="mt-0.5 text-[0.65rem] font-medium text-ink-400 tabular opacity-0 transition-opacity group-hover:opacity-100">
                  {brand.productCount} ürün
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
