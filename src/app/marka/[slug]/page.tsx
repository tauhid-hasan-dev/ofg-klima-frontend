import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/commerce/Breadcrumb";
import { ListingPageSkeleton, ListingSkeleton } from "@/components/commerce/ListingSkeleton";
import { ProductListing } from "@/components/commerce/ProductListing";
import { Container } from "@/components/ui/Container";
import {
  getAllBrandSlugs,
  getBrand,
  getChildCategories,
  getTopLevelCategories,
  listProducts,
} from "@/lib/repository";
import { parseProductQuery, type RawSearchParams } from "@/lib/search-params";
import { site } from "@/lib/site";
import type { Brand } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateStaticParams() {
  const slugs = await getAllBrandSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Marka bulunamadı" };

  const title = `${brand.headline ?? brand.name} Modelleri ve Fiyatları`;

  return {
    title,
    description:
      brand.description ??
      `${brand.name} yedek parça modelleri, güncel fiyatları ve stok durumu ${site.name}'da.`,
    alternates: { canonical: `/marka/${brand.slug}` },
    openGraph: { title: `${title} | ${site.name}`, url: `/marka/${brand.slug}` },
  };
}

/**
 * The filtered grid. Split out because it reads `searchParams`, which is
 * runtime data — keeping it behind Suspense lets the heading, breadcrumb and
 * brand copy prerender into the static shell while results stream in.
 */
async function BrandResults({
  brand,
  searchParams,
}: {
  brand: Brand;
  searchParams: Promise<RawSearchParams>;
}) {
  const resolved = await searchParams;
  const query = parseProductQuery(resolved);

  // The page's own brand is pinned; the sidebar's brand facet is therefore
  // suppressed and the user filters by vehicle, stock and price instead.
  const result = await listProducts({ ...query, brand: [brand.slug] });

  const topCategories = await getTopLevelCategories();
  const childLists = await Promise.all(topCategories.map((category) => getChildCategories(category.slug)));
  const relevant = new Set(result.facets.categories.map((facet) => facet.slug));

  const categoryLinks = [...topCategories, ...childLists.flat()].filter((category) =>
    relevant.has(category.slug),
  );

  return (
    <ProductListing
      pathname={`/marka/${brand.slug}`}
      searchParams={resolved}
      result={result}
      sort={query.sort ?? "recommended"}
      categoryLinks={categoryLinks}
      lockedFilters={[{ label: "Marka", value: brand.name }]}
      showBrandFacet={false}
      emptyTitle={`${brand.name} için bu filtrelerle ürün bulunamadı`}
    />
  );
}

async function BrandContent({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: brand.headline ?? brand.name,
    description: brand.description,
    url: `${site.url}/marka/${brand.slug}`,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    about: { "@type": "Brand", name: brand.name },
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Markalar", href: "/marka" }, { label: brand.name }]} />

      <header className="pb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
          {brand.headline ?? brand.name}
        </h1>
        {brand.description ? (
          <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-ink-600">{brand.description}</p>
        ) : null}
      </header>

      <Suspense fallback={<ListingSkeleton />}>
        <BrandResults brand={brand} searchParams={searchParams} />
      </Suspense>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

/**
 * `params` is URL data as well, so it belongs behind a boundary too — without
 * one, a client-side navigation into this route cannot paint an instant shell.
 */
export default function BrandPage({ params, searchParams }: PageProps) {
  return (
    <Container>
      <Suspense fallback={<ListingPageSkeleton />}>
        <BrandContent params={params} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
