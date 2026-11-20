import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/commerce/Breadcrumb";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ChevronRightIcon } from "@/components/ui/icons";
import { getBrandsWithCounts } from "@/lib/repository";
import { site } from "@/lib/site";
import { compareTr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tüm Markalar",
  description:
    "Sanden, Denso, Valeo, Wutse, Safkar ve daha fazlası. Oto klima yedek parçalarında çalıştığımız tüm üretici ve araç markaları.",
  alternates: { canonical: "/marka" },
};

function BrandTile({
  slug,
  name,
  country,
  productCount,
}: {
  slug: string;
  name: string;
  country?: string;
  productCount: number;
}) {
  return (
    <li>
      <Link
        href={`/marka/${slug}`}
        className="group flex h-full min-w-0 flex-col justify-between gap-3 rounded-card bg-white p-4 ring-1 ring-ink-200 transition-all hover:-translate-y-0.5 hover:shadow-card-hover hover:ring-ink-950 sm:p-5"
      >
        <div className="min-w-0">
          {/* Wordmark stand-in: the real brand logos are licensed assets the
              client will supply, so we set the name in the display face.
              `break-words` matters here — "VOLKSWAGEN" is a single unbreakable
              token that overflows a two-column grid at 320px. */}
          <span className="block font-display text-lg font-extrabold tracking-tight break-words text-ink-950 uppercase sm:text-xl">
            {name}
          </span>
          {country ? <span className="mt-0.5 block truncate text-xs text-ink-500">{country}</span> : null}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-600 tabular">{productCount} ürün</span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-100 text-ink-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </li>
  );
}

export default async function BrandIndexPage() {
  const all = await getBrandsWithCounts();

  const manufacturers = all
    .filter((brand) => brand.kind === "manufacturer")
    .sort((a, b) => b.productCount - a.productCount || compareTr(a.name, b.name));

  const vehicles = all
    .filter((brand) => brand.kind === "vehicle")
    .sort((a, b) => compareTr(a.name, b.name));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tüm Markalar",
    url: `${site.url}/marka`,
    hasPart: manufacturers.map((brand) => ({
      "@type": "Brand",
      name: brand.name,
      url: `${site.url}/marka/${brand.slug}`,
    })),
  };

  return (
    <Container>
      <Breadcrumb items={[{ label: "Markalar" }]} />

      <header className="pb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
          Tüm Markalar
        </h1>
        <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-ink-600">
          Oto klima sistemlerinde çalıştığımız üretici markaları ve parça aradığınız araç markalarını buradan
          inceleyebilirsiniz. Aradığınız markayı bulamazsanız WhatsApp hattımızdan bize yazın.
        </p>
      </header>

      <section className="pb-12">
        <SectionHeading title="Üretici Markaları" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {manufacturers.map((brand) => (
            <BrandTile key={brand.slug} {...brand} />
          ))}
        </ul>
      </section>

      <section className="pb-16">
        <SectionHeading title="Araç Markasına Göre" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {vehicles.map((brand) => (
            <BrandTile key={brand.slug} {...brand} />
          ))}
        </ul>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Container>
  );
}
