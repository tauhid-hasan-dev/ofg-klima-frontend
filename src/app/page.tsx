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

const slides: Slide[] = [
  {
    eyebrow: "Sanden Yetkili Stok",
    title: "Sanden Klima Kompresörleri",
    text: "SD5H14, SD7H15, SD6V12 ve PXE serisi kompresörler stoklarımızda. Orijinal kutusunda, faturalı ve 12 ay garantili.",
    href: "/marka/sanden",
    cta: "Şimdi İncele",
    image: "/parts/kompresor.svg",
  },
  {
    eyebrow: "Komple Set Avantajı",
    title: "Klima Kasnak Setleri",
    text: "Kasnak, manyetik bobin ve baskı plakası tek pakette. Tek tek parça aramaya son.",
    href: "/kategori/klima-kasnak-seti",
    cta: "Setleri Gör",
    image: "/parts/kasnak.svg",
  },
  {
    eyebrow: "Yeni Sezon",
    title: "Kondenser ve Klima Radyatörleri",
    text: "Alüminyum kanatlı, sızdırmazlık testinden geçmiş kondenserler. Üniversal ve araca özel ölçülerde.",
    href: "/kategori/klima-radyatoru",
    cta: "Ürünleri İncele",
    image: "/parts/kondenser.svg",
  },
  {
    eyebrow: "R134a / R1234yf",
    title: "Oto Klima Gazları",
    text: "Orijinal ambalajında soğutucu akışkanlar, 1 kg bidondan 13,6 kg tüpe kadar.",
    href: "/kategori/oto-klima-gazi",
    cta: "Gaz Çeşitleri",
    image: "/parts/gaz.svg",
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
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
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
      <BrandStrip brands={manufacturers.map(({ slug, name, productCount }) => ({ slug, name, productCount }))} />

      {/* Category entry points */}
      <Container className="pt-14">
        <SectionHeading title="Ürün Kategorileri" href="/marka" hrefLabel="Tüm Markalar" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map(({ category, children }) => (
            <li key={category.slug}>
              <div className="group flex h-full flex-col overflow-hidden rounded-card bg-white ring-1 ring-ink-200 transition-shadow hover:shadow-card-hover">
                <Link href={`/kategori/${category.slug}`} className="block bg-ink-50 p-5">
                  <Image
                    src={category.image}
                    alt=""
                    width={400}
                    height={300}
                    className="mx-auto h-28 w-auto transition-transform duration-300 group-hover:scale-105"
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

      {/* Two-up brand banners, as on the reference home page */}
      <Container className="pt-14">
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            // One red panel, one ink: on the red one the brand name has to be
            // white, since brand-400 on brand-600 is two reds on top of each
            // other.
            { slug: "valeo", name: "VALEO", theme: "bg-brand-600", title: "text-white", image: "/parts/kompresor.svg" },
            { slug: "denso", name: "DENSO", theme: "bg-ink-950", title: "text-brand-400", image: "/parts/kompresor.svg" },
          ].map((banner) => (
            <Link
              key={banner.slug}
              href={`/marka/${banner.slug}`}
              className={`group relative flex min-h-[15rem] items-center overflow-hidden rounded-card ${banner.theme}`}
            >
              <div className="relative z-10 max-w-[55%] p-8 lg:p-10">
                <span className={`block font-display text-2xl font-extrabold tracking-tight ${banner.title}`}>
                  {banner.name}
                </span>
                <span className="mt-1 block font-display text-lg font-bold tracking-tight text-white uppercase">
                  Klima Kompresörü
                </span>
                <span className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-bold text-ink-950">
                  Ürünleri İncele!
                </span>
              </div>
              <Image
                src={banner.image}
                alt=""
                width={420}
                height={315}
                className="absolute right-0 bottom-0 h-auto w-[48%] max-w-[16rem] translate-x-4 transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </Container>

      <Suspense fallback={<PricedSectionsFallback />}>
        <PricedSections brandNames={brandNames} />
      </Suspense>

      {/* Fitment help — the single biggest source of enquiries in this trade */}
      <Container className="pt-16">
        <div className="overflow-hidden rounded-card bg-ink-950">
          <div className="grid items-center gap-8 p-8 lg:grid-cols-[1.3fr_1fr] lg:p-12">
            <div>
              <span className="inline-block bg-brand-500 px-2.5 py-1 font-display text-xs font-bold tracking-[0.12em] text-white uppercase">
                Doğru Parça Garantisi
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Aracınıza hangi kompresör uyuyor, emin değil misiniz?
              </h2>
              <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink-300">
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
                  <span className="text-sm text-ink-200">{item.text}</span>
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
                className="inline-flex items-center gap-2 rounded-full border border-ink-300 py-2 pr-3 pl-4 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-950 hover:bg-ink-950 hover:text-brand-400"
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
