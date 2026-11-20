import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb, type Crumb } from "@/components/commerce/Breadcrumb";
import { ListingPageSkeleton, ListingSkeleton } from "@/components/commerce/ListingSkeleton";
import { ProductListing } from "@/components/commerce/ProductListing";
import { Container } from "@/components/ui/Container";
import {
  getAllCategorySlugs,
  getCategory,
  getCategoryRail,
  getCategoryTrail,
  listProducts,
} from "@/lib/repository";
import { parseProductQuery, type RawSearchParams } from "@/lib/search-params";
import { site } from "@/lib/site";
import type { Category } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Kategori bulunamadı" };

  return {
    title: `${category.name} Modelleri ve Fiyatları`,
    description:
      category.description ??
      `${category.name} ürünleri, güncel fiyatlar ve stok durumu ${site.name}'da. Hızlı kargo, faturalı satış.`,
    alternates: { canonical: `/kategori/${category.slug}` },
  };
}

/** Runtime half of the page — see the note in /marka/[slug]/page.tsx. */
async function CategoryResults({
  category,
  searchParams,
}: {
  category: Category;
  searchParams: Promise<RawSearchParams>;
}) {
  const resolved = await searchParams;
  const query = parseProductQuery(resolved);
  const result = await listProducts({ ...query, category: category.slug });

  /*
   * Requirement 8 — the rail lists every top-level group, and the one you are
   * in expands to its sub-headings.
   *
   * The earlier version listed only the current category's children (or its
   * siblings on a leaf page), which meant the rail changed shape under you as
   * you moved around and never showed the rest of the catalogue. Listing all
   * the groups and expanding one keeps a fixed frame of reference.
   */
  const { tops, childrenBySlug } = await getCategoryRail();

  return (
    <ProductListing
      pathname={`/kategori/${category.slug}`}
      searchParams={resolved}
      result={result}
      sort={query.sort ?? "recommended"}
      categoryLinks={tops}
      categoryChildren={childrenBySlug}
      // A leaf expands its parent, so the group you are inside stays visible.
      activeCategory={category.parent ?? category.slug}
      emptyTitle={`${category.name} kategorisinde bu filtrelerle ürün bulunamadı`}
    />
  );
}

async function CategoryContent({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const trail = await getCategoryTrail(category.slug);
  const crumbs: Crumb[] = trail.map((item, index) => ({
    label: item.name,
    href: index < trail.length - 1 ? `/kategori/${item.slug}` : undefined,
  }));

  return (
    <>
      <Breadcrumb items={crumbs} />

      <header className="pb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-ink-600">{category.description}</p>
        ) : null}
      </header>

      <Suspense fallback={<ListingSkeleton />}>
        <CategoryResults category={category} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

/** See the note in /marka/[slug]/page.tsx about wrapping `params`. */
export default function CategoryPage({ params, searchParams }: PageProps) {
  return (
    <Container>
      <Suspense fallback={<ListingPageSkeleton />}>
        <CategoryContent params={params} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
