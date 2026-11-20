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
        <ul className="scrollbar-none -mx-1 flex items-stretch gap-1 overflow-x-auto py-3">
          {brands.map((brand) => {
            const logo = brand.logo;

            return (
              <li key={brand.slug} className="shrink-0">
                <Link
                  href={`/marka/${brand.slug}`}
                  className="group flex h-16 min-w-[8.5rem] flex-col items-center justify-center rounded-md px-5 transition-colors hover:bg-white"
                  title={`${brand.name} ürünleri`}
                >
                  {logo ? (
                    <Image
                      src={logo}
                      alt={brand.name}
                      width={512}
                      height={99}
                      /*
                       * Desaturated until hovered. Eleven logos in eleven
                       * different brand colours, in a strip sitting directly
                       * under a photographic hero, pulled the eye away from
                       * the catalogue below. Grey makes the row read as one
                       * object, and the hover picks out the one being
                       * considered.
                       */
                      className="h-7 w-auto max-w-[7.5rem] object-contain opacity-60 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="font-display text-base font-extrabold tracking-[0.06em] text-ink-400 uppercase transition-colors group-hover:text-navy-600">
                      {brand.name}
                    </span>
                  )}

                  <span className="mt-0.5 text-[0.65rem] font-medium text-ink-400 tabular opacity-0 transition-opacity group-hover:opacity-100">
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
