import Image from "next/image";
import Link from "next/link";

/**
 * Manufacturer strip — requirement 4.
 *
 * "banner altı sattığımız ürünlerin iconları görünmesi. ve ilgili icona
 * tıklandığında o markanın ürünleri görünmesi." The reference site runs a row
 * of supplier logos near the top of the page; each one opens that brand's
 * listing.
 *
 * No heading and no frames around the marks — just the logos, moving. A
 * supplier row directly under the hero is read, not studied: a title would
 * announce it as a section to be worked through, and a card around each logo
 * would compete with the real cards further down the page for the same
 * attention. The stock count stays under each mark, because "49 ürün" is the
 * part of a logo wall a trade buyer is actually checking.
 *
 * It moves because eleven marks will not sit legibly in a row the page is
 * wide enough for, and a static overflow row hides whatever falls off the
 * right edge for good. The track carries on left to right and pauses the
 * moment a pointer or the keyboard reaches it — see `.brand-marquee` in
 * globals.css for how the loop is made seamless.
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
    <section aria-label="Sattığımız markalar" className="pt-14 pb-12">
      {/* Full-bleed on purpose: the track has to run off both edges of the
          page for the loop to read as continuous rather than as a row
          shuffling inside a box. */}
      <div className="brand-marquee flex overflow-hidden">
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
      /*
       * The second track is the same list again, there only to fill the space
       * the first one leaves as it slides. Hidden from assistive tech and
       * taken out of the tab order so the eleven brands are announced once.
       */
      {...(duplicate ? { "aria-hidden": true } : {})}
    >
      {brands.map((brand) => (
        /* The spacing lives on the item, not as a flex `gap`: a gap between
           the two tracks would not be part of the translated width and the
           row would jump by that much on every repeat. */
        <li key={brand.slug} className="shrink-0 px-2.5">
          <Link
            href={`/marka/${brand.slug}`}
            tabIndex={duplicate ? -1 : undefined}
            title={`${brand.name} ürünleri`}
            /* No frame: the ring and the card went with the heading. What
               marks the hover is a tint and a lift, which is enough on a row
               that is already moving. */
            className="group flex h-28 w-[13rem] flex-col items-center justify-center gap-2 rounded-xl px-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-navy-50"
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
                className="h-11 w-auto max-w-[9.5rem] object-contain transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <span className="font-display text-xl font-extrabold tracking-[0.06em] text-ink-500 uppercase transition-colors group-hover:text-navy-600">
                {brand.name}
              </span>
            )}

            <span className="text-[0.68rem] font-medium text-ink-400 tabular transition-colors group-hover:text-navy-600">
              {brand.productCount} ürün
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
