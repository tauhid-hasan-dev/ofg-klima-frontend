import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ChevronRightIcon } from "@/components/ui/icons";

export interface VehicleBrand {
  slug: string;
  name: string;
  productCount: number;
}

/**
 * Photography for the five cards.
 *
 * Real compressor shots, not the generated renders that were here before.
 * Every one of them was lit on a dark set, which is exactly why the cards
 * went to a navy gradient rather than a pale one: a light tile would have
 * needed the parts cut out of their backgrounds, and a dark scrim over the
 * photograph keeps the lighting the photographer already put on the metal.
 *
 * `focus` places the part inside a tile far narrower than the source frame —
 * these are 2.37:1 banners being cropped to roughly 3:2, so left to centre
 * the subject would sit half outside the card.
 *
 * Four sources across five tiles. The obvious fifth, theme-1, is the one
 * compressor shot on a red set: under a navy scrim it turned magenta and the
 * card stopped belonging to the other four. The first banner is used twice
 * instead, cropped to opposite ends of the same compressor — the feature
 * takes the pulley, the last tile the port fittings — which reads as two
 * photographs rather than one repeated.
 *
 * All of them are the reference shop's photographs and have to be replaced
 * before launch; see scripts/fetch-reference-media.py.
 */
const FEATURE_PHOTO = { src: "/banners/hero-1.jpg", focus: "62% center" };
const CARD_PHOTOS = [
  { src: "/banners/hero-2.jpg", focus: "66% center" },
  { src: "/banners/theme-2.png", focus: "72% center" },
  { src: "/banners/hero-3.jpg", focus: "62% center" },
  { src: "/banners/hero-1.jpg", focus: "86% center" },
] as const;

/** How many makes get a card. The rest run as a plain list underneath. */
const FEATURED = 5;

/*
 * The scrims.
 *
 * Both run navy over the photograph, but in the direction the copy sits:
 * across on the small cards, down on the feature. They are near-opaque where
 * the type is and thin where the part is, so the card reads as one blue
 * surface without burying the thing it is selling.
 */
const CARD_SCRIM =
  "bg-[linear-gradient(100deg,rgba(17,16,42,0.96)_0%,rgba(17,16,42,0.88)_36%,rgba(28,25,65,0.58)_66%,rgba(28,25,65,0.28)_100%)]";
const FEATURE_SCRIM =
  "bg-[linear-gradient(180deg,rgba(17,16,42,0.95)_0%,rgba(17,16,42,0.82)_30%,rgba(28,25,65,0.48)_62%,rgba(28,25,65,0.34)_100%)]";

/**
 * "Aracınızın Markasını Seçin" — the vehicle-make entry point.
 *
 * A five-card mosaic: two stacked either side of one double-height feature,
 * following the reference storefront's brand section. The feature is not a
 * design flourish — it goes to the make with the deepest stock, so the
 * largest tile is also the most likely answer.
 *
 * No carmaker logos anywhere, deliberately. Those marks belong to Renault,
 * Ford and the rest; a reseller showing *Sanden* or *Denso* (parts it
 * actually stocks) is on very different ground from showing a carmaker's
 * badge, and we hold no licence for them. The make is set as type instead,
 * in brand-400 — the lighter red, because the darker one is 2.4:1 on navy
 * and unreadable.
 *
 * The nine makes that do not get a card are listed under it rather than
 * dropped. On a parts site the make is how people search, and a buyer whose
 * car is a Citroën should not have to work out that "Tüm Markalar" is where
 * they go.
 */
export function VehicleBrandGrid({ brands }: { brands: VehicleBrand[] }) {
  if (brands.length === 0) return null;

  // Deepest stock first, so the feature card is the one most likely wanted.
  const ranked = [...brands].sort((a, b) => b.productCount - a.productCount);
  const [feature, ...others] = ranked.slice(0, FEATURED);
  const cards = others.slice(0, 4);
  const remaining = ranked.slice(FEATURED);

  if (!feature) return null;

  return (
    <Container as="section" className="pt-14">
      <SectionHeading title="Aracınızın Markasını Seçin" href="/marka" hrefLabel="Tüm Markalar" />

      {/*
        One column on a phone, two at sm, and the mosaic proper at lg where
        there is room for a double-height tile. The explicit row/column
        placement is what keeps the feature in the middle — left this to
        source order it lands first, pushing the pairs out of their columns.
      */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
        {cards[0] ? <BrandCard brand={cards[0]} photo={CARD_PHOTOS[0]} className="lg:col-start-1 lg:row-start-1" /> : null}
        {cards[1] ? <BrandCard brand={cards[1]} photo={CARD_PHOTOS[1]} className="lg:col-start-1 lg:row-start-2" /> : null}

        <FeatureCard brand={feature} />

        {cards[2] ? <BrandCard brand={cards[2]} photo={CARD_PHOTOS[2]} className="lg:col-start-3 lg:row-start-1" /> : null}
        {cards[3] ? <BrandCard brand={cards[3]} photo={CARD_PHOTOS[3]} className="lg:col-start-3 lg:row-start-2" /> : null}
      </div>

      {remaining.length > 0 ? (
        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-ink-500">
          {remaining.map((brand, index) => (
            <span key={brand.slug} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true" className="text-ink-300">·</span> : null}
              <Link href={`/marka/${brand.slug}`} className="font-medium transition-colors hover:text-brand-600">
                {brand.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </Container>
  );
}

type Photo = { src: string; focus: string };

function BrandCard({
  brand,
  photo,
  className,
}: {
  brand: VehicleBrand;
  photo: Photo;
  className?: string;
}) {
  return (
    <Link
      href={`/marka/${brand.slug}`}
      title={`${brand.name} klima kompresörleri`}
      className={`group relative isolate flex min-h-[11.5rem] flex-col justify-center overflow-hidden rounded-2xl bg-navy-950 p-6 transition-shadow duration-200 hover:shadow-card-hover ${className ?? ""}`}
    >
      <Image
        src={photo.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
        className="-z-10 object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: photo.focus }}
      />
      <span aria-hidden="true" className={`absolute inset-0 -z-10 ${CARD_SCRIM}`} />

      <span className="relative max-w-[62%]">
        <span className="block font-display text-lg leading-tight font-extrabold tracking-tight text-brand-400 uppercase">
          {brand.name}
        </span>
        <span className="mt-1 block font-display text-[0.8rem] font-bold tracking-wide text-navy-100 uppercase">
          Klima Kompresörü
        </span>
        <span className="mt-5 inline-flex items-center gap-1 text-[0.82rem] font-semibold text-white">
          Ürünleri İncele!
          <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  );
}

function FeatureCard({ brand }: { brand: VehicleBrand }) {
  return (
    <Link
      href={`/marka/${brand.slug}`}
      title={`${brand.name} klima kompresörleri`}
      className="group relative isolate flex min-h-[22rem] flex-col items-center overflow-hidden rounded-2xl bg-navy-950 p-8 text-center transition-shadow duration-200 hover:shadow-card-hover sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-span-2 lg:row-start-1"
    >
      <Image
        src={FEATURE_PHOTO.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 34vw, 100vw"
        className="-z-10 object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: FEATURE_PHOTO.focus }}
      />
      <span aria-hidden="true" className={`absolute inset-0 -z-10 ${FEATURE_SCRIM}`} />

      <span className="relative font-display text-2xl leading-tight font-extrabold tracking-tight text-brand-400 uppercase">
        {brand.name}
      </span>
      <span className="relative mt-1.5 font-display text-sm font-bold tracking-wide text-navy-100 uppercase">
        Klima Kompresörü
      </span>

      <span className="relative mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-ink-900 shadow-[0_4px_14px_-4px_rgba(17,16,42,0.5)] transition-colors group-hover:bg-brand-500 group-hover:text-white">
        Ürünleri İncele!
        <ChevronRightIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}
