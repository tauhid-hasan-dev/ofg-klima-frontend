import Image from "next/image";
import Link from "next/link";

/**
 * Manufacturer strip under the hero — requirement 4.
 *
 * "banner altı sattığımız ürünlerin iconları görünmesi. ve ilgili icona
 * tıklandığında o markanın ürünleri görünmesi." The reference site runs a row
 * of supplier logos immediately below the banner; each one opens that brand's
 * listing.
 *
 * It scrolls itself left to right rather than sitting still, which is what
 * makes eleven logos readable in a row that is only wide enough for seven —
 * and it is why the section is full-bleed with no background or rule of its
 * own: a moving row inside a boxed grey band reads as an advert, where the
 * same row on the page reads as part of the page. It pauses on hover and on
 * focus so the logos stay clickable.
 *
 * Where a wordmark exists under public/brands/ it is rendered; a brand with no
 * artwork falls back to its name set in the display face. Both shapes occupy
 * the same height, so a mixed row still reads as a logo wall.
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
    <section aria-labelledby="marka-serisi" className="pt-14 pb-12">
      <h2 id="marka-serisi" className="sr-only">
        Sattığımız markalar
      </h2>

      <div className="brand-marquee flex overflow-hidden">
        {/*
          The second track is the same list again, purely to fill the gap the
          first one leaves as it slides. It is hidden from assistive tech and
          taken out of the tab order so the eleven brands are announced once.
        */}
        <Track brands={brands} />
        <Track brands={brands} duplicate />
      </div>
    </section>
  );
}

function Track({ brands, duplicate = false }: { brands: StripBrand[]; duplicate?: boolean }) {
  return (
    <ul
      className="brand-marquee-track flex shrink-0 items-center"
      {...(duplicate ? { "aria-hidden": true } : {})}
    >
      {brands.map((brand) => (
        <li key={brand.slug} className="shrink-0">
          <Link
            href={`/marka/${brand.slug}`}
            tabIndex={duplicate ? -1 : undefined}
            className="group flex h-28 min-w-[11rem] flex-col items-center justify-center rounded-lg px-8 transition-colors hover:bg-navy-50"
            title={`${brand.name} ürünleri`}
          >
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={512}
                height={99}
                /* Each maker's own colours. These are the names a parts buyer
                   is scanning for, so they are shown as supplied rather than
                   flattened to grey. */
                className="h-12 w-auto max-w-[10rem] object-contain transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <span className="font-display text-xl font-extrabold tracking-[0.06em] text-ink-500 uppercase transition-colors group-hover:text-navy-600">
                {brand.name}
              </span>
            )}

            <span className="mt-1.5 text-[0.7rem] font-medium text-ink-400 tabular opacity-0 transition-opacity group-hover:opacity-100">
              {brand.productCount} ürün
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
