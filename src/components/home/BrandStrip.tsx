import Image from "next/image";
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
 * Where a wordmark exists under public/brands/ it is rendered; a brand with no
 * artwork falls back to its name set in the display face, which is what every
 * one of them used to do. Both shapes occupy the same height, so a mixed row
 * still reads as a logo wall rather than as a list with pictures in it.
 *
 * These are each manufacturer's own mark — Sanden, Denso, Valeo and so on —
 * which is what a parts reseller is in the business of displaying. Do not
 * confuse them with the banner photography under public/banners/, which is
 * another shop's and has to be replaced before launch.
 */
export interface StripBrand {
  slug: string;
  name: string;
  productCount: number;
  /** Wordmark path, resolved by the repository. Absent means render text. */
  logo?: string;
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
        <ul className="scrollbar-none -mx-1 flex items-stretch gap-1 overflow-x-auto py-4">
          {brands.map((brand) => {
            const logo = brand.logo;

            return (
              <li key={brand.slug} className="shrink-0">
                <Link
                  href={`/marka/${brand.slug}`}
                  className="group flex h-[5.5rem] min-w-[10rem] flex-col items-center justify-center rounded-md px-6 transition-colors hover:bg-white"
                  title={`${brand.name} ürünleri`}
                >
                  {logo ? (
                    <Image
                      src={logo}
                      alt={brand.name}
                      width={512}
                      height={99}
                      /* Each maker's own colours. These are the names a parts
                         buyer is scanning for, so they are shown as supplied
                         rather than flattened to grey. */
                      className="h-10 w-auto max-w-[9.5rem] object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <span className="font-display text-lg font-extrabold tracking-[0.06em] text-ink-500 uppercase transition-colors group-hover:text-navy-600">
                      {brand.name}
                    </span>
                  )}

                  <span className="mt-1 text-[0.68rem] font-medium text-ink-400 tabular opacity-0 transition-opacity group-hover:opacity-100">
                    {brand.productCount} ürün
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
