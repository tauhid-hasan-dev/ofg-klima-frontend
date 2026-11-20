import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/commerce/Breadcrumb";
import { ListingSkeleton } from "@/components/commerce/ListingSkeleton";
import { ProductListing } from "@/components/commerce/ProductListing";
import { Container } from "@/components/ui/Container";
import { getCategoryRail, listProducts } from "@/lib/repository";
import { parseProductQuery, type RawSearchParams } from "@/lib/search-params";
import { site } from "@/lib/site";

/**
 * Yeni Ürünler — requirement 2 in the header, requirement 15 in substance.
 *
 * "A product added to DIA appears on our site under new arrivals, converted to
 * TL and marked up by its category percentage." This page is the first half of
 * that sentence and needs no special machinery: it is the catalogue sorted by
 * `createdAt` descending, so an imported card surfaces here the moment it
 * exists. The second half is handled in `src/lib/pricing.ts` and
 * `src/lib/exchange-rate.ts`.
 *
 * Sort is pinned to "newest" — a "new arrivals" page the visitor can re-sort
 * by price is no longer a new-arrivals page.
 */

export const metadata: Metadata = {
  title: "Yeni Ürünler",
  description: `${site.name} kataloğuna en son eklenen oto klima yedek parçaları. Güncel fiyatlar TCMB kuru ile hesaplanır.`,
  alternates: { canonical: "/yeni-urunler" },
};

async function NewArrivals({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const resolved = await searchParams;
  const query = parseProductQuery(resolved);

  const [result, rail] = await Promise.all([
    listProducts({ ...query, sort: "newest" }),
    getCategoryRail(),
  ]);

  return (
    <>
      <Breadcrumb items={[{ label: "Yeni Ürünler" }]} />

      <header className="pb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
          Yeni Ürünler
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
          Stoğumuza en son giren parçalar, yeniden eskiye doğru sıralanır. Fiyatlar güncel Merkez Bankası kuru ile
          hesaplanmaktadır.
        </p>
      </header>

      <ProductListing
        pathname="/yeni-urunler"
        searchParams={resolved}
        result={result}
        sort="newest"
        showSort={false}
        categoryLinks={rail.tops}
        categoryChildren={rail.childrenBySlug}
        activeCategory={query.category}
        emptyTitle="Bu filtrelerle yeni ürün bulunamadı"
        emptyBody="Filtreleri gevşetmeyi deneyin ya da tüm kataloğa göz atın."
      />
    </>
  );
}

export default function NewArrivalsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <Container>
      <Suspense
        fallback={
          <>
            <div className="h-[4.5rem]" />
            <ListingSkeleton />
          </>
        }
      >
        <NewArrivals searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
