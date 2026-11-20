import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProductGrid } from "@/components/commerce/ProductCard";
import { BrandStrip } from "@/components/home/BrandStrip";
import { FeaturedTabs } from "@/components/home/FeaturedTabs";
import { HeroSlider, type Slide } from "@/components/home/HeroSlider";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ChevronRightIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/format";
import {
  getBrandsWithCounts,
  getChildCategories,
  getFeaturedProducts,
  getNewestProducts,
  getTopLevelCategories,
} from "@/lib/repository";
import { site } from "@/lib/site";
import { compareTr } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Hero slides.
 *
 * Each one is a photograph of the part it is selling, shot on a dark set with
 * the subject to the right — which is why the copy sits left and the scrim
 * ramps that way. `focus` pushes the crop right so the part survives the hard
 * horizontal crop a portrait phone gives a 2.37:1 image.
 *
 * Three slides, not four: there are three banner photographs, and a fourth
 * slide would have to fall back to a drawing and break the set. Adding one is
 * a matter of dropping `public/banners/hero-4.jpg` in and adding the entry.
 */
const slides: Slide[] = [
  {
    eyebrow: "Sanden Yetkili Stok",
    title: "Sanden Klima Kompresörleri",
    text: "SD5H14, SD7H15, SD6V12 ve PXE serisi kompresörler stoklarımızda. Orijinal kutusunda, faturalı ve 12 ay garantili.",
    href: "/marka/sanden",
    cta: "Şimdi İncele",
    image: "/banners/hero-1.jpg",
    focus: "72% center",
  },
  {
    eyebrow: "Geniş Araç Uyumu",
    title: "Wutse Klima Kompresörleri",
    text: "Binek ve ticari araçlar için muadil kompresörler. Her ürün OEM kodu ve uyumlu araç listesiyle birlikte yayınlanır.",
    href: "/marka/wutse",
    cta: "Ürünleri İncele",
    image: "/banners/hero-2.jpg",
    focus: "70% center",
  },
  {
    eyebrow: "Komple Set Avantajı",
    title: "Klima Kasnak Setleri",
    text: "Kasnak, manyetik bobin ve baskı plakası tek pakette. Tek tek parça aramaya son.",
    href: "/kategori/kompresor-yedek-parca",
    cta: "Setleri Gör",
    image: "/banners/hero-3.jpg",
    focus: "68% center",
  },
];

const FEATURED_SECTIONS = [
  { slug: "klima-kompresoru", title: "Klima Kompresörü" },
  { slug: "klima-radyatoru", title: "Klima Radyatörü" },
  { slug: "klima-kasnak-seti", title: "Klima Kasnak Seti" },
] as const;

/**
 * The two sections of the home page that show prices.
 *
 * Split out and pushed behind a Suspense boundary because of `connection()`:
 * prices are USD converted at the current TCMB rate, and a prerendered home
 * page would freeze that rate at build time and keep quoting it until the next
 * deploy. Everything else on this page — the hero, the category cards, the
 * brand strip, the SEO copy — has no price in it and stays fully static.
 */
async function PricedSections({ brandNames }: { brandNames: Record<string, string> }) {
  await connection();

  const [featured, newest] = await Promise.all([
    Promise.all(
      FEATURED_SECTIONS.map(async (section) => ({
        ...section,
        products: await getFeaturedProducts(section.slug, 8),
      })),
    ),
    getNewestProducts(8),
  ]);

  return (
    <>
      {/* Featured products — one section with pill tabs, matching the reference */}
      <Container className="pt-14">
        <FeaturedTabs groups={featured} brandNames={brandNames} />
      </Container>

      {/* Newest arrivals — requirement 2 on the home page, requirement 15 in
          substance: a product imported from DIA shows up here on its own. */}
      <Container className="pt-14">
        <SectionHeading title="Yeni Ürünler" href="/yeni-urunler" />
        <ProductGrid products={newest} brandNames={brandNames} />
      </Container>
    </>
  );
}

function PricedSectionsFallback() {
  return (
    <Container className="pt-14">
      <div className="h-8 w-56 animate-pulse rounded bg-ink-100" />
      <div className="mt-6 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-card bg-ink-100" />
        ))}
      </div>
    </Container>
  );
}

export default async function HomePage() {
  const [topCategories, allBrands] = await Promise.all([getTopLevelCategories(), getBrandsWithCounts()]);

  const categoryCards = await Promise.all(
    topCategories.map(async (category) => ({
      category,
      children: (await getChildCategories(category.slug)).slice(0, 4),
    })),
  );

  const brandNames = Object.fromEntries(allBrands.map((brand) => [brand.slug, brand.name]));

  const manufacturers = allBrands
    .filter((brand) => brand.kind === "manufacturer" && brand.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount);

  const vehicleBrands = allBrands
    .filter((brand) => brand.kind === "vehicle")
    .sort((a, b) => compareTr(a.name, b.name))
    .slice(0, 12);

  const organisationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: site.legalName,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.district,
      addressRegion: site.address.city,
      addressCountry: "TR",
    },
    sameAs: [site.social.instagram, site.social.facebook, site.social.youtube],
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/arama?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {/* Full-bleed: deliberately outside Container so it spans the viewport. */}
      <HeroSlider slides={slides} />

      {/* Requirement 4 — supplier logos directly under the banner. */}
      <BrandStrip brands={manufacturers.map(({ slug, name, productCount, logo }) => ({ slug, name, productCount, logo }))} />

      {/* Category entry points */}
      <Container className="pt-14">
        <SectionHeading title="Ürün Kategorileri" href="/marka" hrefLabel="Tüm Markalar" />
        <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {categoryCards.map(({ category, children }) => (
            <li key={category.slug}>
              <div className="group flex h-full flex-col overflow-hidden rounded-card bg-white ring-1 ring-ink-200 transition-shadow hover:shadow-card-hover">
                {/* White, not grey: these tiles now mix photographs shot on a
                    white sweep with generated renders, and a grey tile put a
                    white rectangle inside a grey frame on every photo. */}
                <Link
                  href={`/kategori/${category.slug}`}
                  className="block border-b border-ink-100 bg-white p-5"
                >
                  <Image
                    src={category.image}
                    alt=""
                    width={400}
                    height={300}
                    className="mx-auto h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-base leading-tight font-bold tracking-tight text-ink-950 uppercase">
                    <Link href={`/kategori/${category.slug}`} className="hover:underline">
                      {category.name}
                    </Link>
                  </h3>

                  {children.length > 0 ? (
                    <ul className="mt-3 space-y-1.5">
                      {children.map((child) => (
                        <li key={child.slug}>
                          <Link
                            href={`/kategori/${child.slug}`}
                            className="flex items-center gap-1.5 text-sm text-ink-600 transition-colors hover:text-ink-950"
                          >
                            <span className="h-1 w-1 rounded-full bg-ink-300" />
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <Link
                    href={`/kategori/${category.slug}`}
                    className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-ink-950 uppercase"
                  >
                    Ürünleri İncele
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      {/* The manufacturer grid that used to sit here was dropped: BrandStrip
          above already lists the same eleven brands, and showing them twice on
          one page made neither instance feel like the way in. */}

      {/*
        Two-up brand banners, as on the reference home page.

        These are photographs rather than panels with a part dropped on them:
        each banner photo already carries its own lit background, so the card
        is the image plus a scrim, and the only drawn element is the type.
      */}
      <Container className="pt-14">
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { slug: "valeo", name: "VALEO", image: "/banners/theme-1.png", focus: "right center" },
            { slug: "denso", name: "DENSO", image: "/banners/theme-2.png", focus: "right center" },
          ].map((banner) => (
            <Link
              key={banner.slug}
              href={`/marka/${banner.slug}`}
              className="group relative flex min-h-[15rem] items-center overflow-hidden rounded-card bg-navy-900"
            >
              <Image
                src={banner.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                style={{ objectPosition: banner.focus }}
              />
              {/* Left-weighted so the type has a surface and the part does not
                  disappear under a flat overlay. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(95deg,rgba(17,16,42,0.92)_0%,rgba(17,16,42,0.72)_38%,rgba(17,16,42,0.12)_72%,transparent_100%)]"
              />

              <div className="relative z-10 max-w-[60%] p-8 lg:p-10">
                <span className="block font-display text-2xl font-extrabold tracking-tight text-white">
                  {banner.name}
                </span>
                <span className="mt-1 block font-display text-lg font-bold tracking-tight text-navy-200 uppercase">
                  Klima Kompresörü
                </span>
                <span className="mt-6 inline-flex h-11 items-center rounded-full bg-brand-500 px-6 text-sm font-bold text-white">
                  Ürünleri İncele!
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>

      <Suspense fallback={<PricedSectionsFallback />}>
        <PricedSections brandNames={brandNames} />
      </Suspense>

      {/* Fitment help — the single biggest source of enquiries in this trade */}
      <Container className="pt-16">
        <div className="overflow-hidden rounded-card bg-navy-900">
          <div className="grid items-center gap-8 p-8 lg:grid-cols-[1.3fr_1fr] lg:p-12">
            <div>
              <span className="inline-block bg-brand-500 px-2.5 py-1 font-display text-xs font-bold tracking-[0.12em] text-white uppercase">
                Doğru Parça Garantisi
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Aracınıza hangi kompresör uyuyor, emin değil misiniz?
              </h2>
              <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-navy-200">
                Şasi numaranızı ya da sökülen parçanın üzerindeki kodu bize iletin; stoğumuzdaki doğru muadili
                dakikalar içinde teyit edelim. Yanlış parça göndermemek, iade sürecinden iyidir.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink
                  href={whatsappLink(site.whatsapp, "Merhaba, aracıma uygun parçayı seçmek için yardım istiyorum.")}
                  external
                  variant="whatsapp"
                  size="lg"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  WhatsApp&apos;tan Sor
                </ButtonLink>
                <ButtonLink href="/arama" variant="primary" size="lg">
                  <SearchIcon className="h-5 w-5" />
                  Parça Kodu ile Ara
                </ButtonLink>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { step: "01", text: "Araç bilgisi veya parça kodunu gönderin" },
                { step: "02", text: "Uygun muadilleri ve fiyatları paylaşalım" },
                { step: "03", text: "Onayınızla aynı gün kargoya verelim" },
              ].map((item) => (
                <li key={item.step} className="flex items-center gap-4 rounded-md bg-white/5 px-4 py-3.5">
                  <span className="font-display text-2xl font-extrabold text-brand-400 tabular">{item.step}</span>
                  <span className="text-sm text-navy-100">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Vehicle brands */}
      <Container className="pt-14">
        <SectionHeading title="Araç Markasına Göre Parça" href="/marka" />
        <ul className="flex flex-wrap gap-2">
          {vehicleBrands.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={`/marka/${brand.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-ink-300 py-2 pr-3 pl-4 text-sm font-semibold text-ink-800 transition-colors hover:border-navy-700 hover:bg-navy-900 hover:text-brand-400"
              >
                {brand.name}
                <span className="rounded-full bg-ink-100 px-1.5 text-[0.7rem] text-ink-600 tabular">
                  {brand.productCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      {/* SEO copy */}
      <Container className="pt-16">
        <div className="max-w-4xl">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-950">
            Oto Klima Yedek Parçada {site.name}
          </h2>
          <div className="mt-4 space-y-4 text-[0.95rem] leading-relaxed text-ink-600">
            <p>
              Oto klima sistemleri, kompresörden kondensere, kasnak setinden ekspansiyon valfine kadar birbirine
              bağlı bir bütündür. Tek bir parçanın yanlış seçilmesi, kısa sürede diğer bileşenlerin de arızalanmasına
              yol açar. {site.name} olarak Sanden, Denso, Valeo, Wutse, Safkar ve Nissens gibi üretici markalarının
              ürünlerini tek çatı altında topluyor; her ürünü OEM kodu, voltaj, kasnak kanal sayısı ve uyumlu araç
              listesiyle birlikte yayınlıyoruz.
            </p>
            <p>
              Binek araçlar için SD6V12 ve PXE serisi kompresörlerden, ağır vasıta ve iş makineleri için SD7H15 ve
              DKS serisi modellere kadar geniş bir stok tutuyoruz. Üniversal klima radyatörleri, R134a ve R1234yf
              soğutucu akışkanlar, PAG yağları ve kaçak tespit sıvıları da aynı sipariş içinde gönderilebilir.
            </p>
            <p>
              Aradığınız parçanın kodunu üst taraftaki arama kutusuna boşluksuz olarak yazabilir ya da sol menüden
              kategori ve marka filtrelerini kullanabilirsiniz. Emin olamadığınız durumlarda WhatsApp hattımızdan
              yazın — doğru parçayı birlikte seçelim.
            </p>
          </div>
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
      />
    </>
  );
}
