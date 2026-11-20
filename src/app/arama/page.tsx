import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/commerce/Breadcrumb";
import { ListingSkeleton } from "@/components/commerce/ListingSkeleton";
import { DetailedSearchForm } from "@/components/commerce/DetailedSearchForm";
import { ProductListing } from "@/components/commerce/ProductListing";
import { Container } from "@/components/ui/Container";
import { getBrands, getCategoryRail, listProducts } from "@/lib/repository";
import { parseProductQuery, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Arama Sonuçları",
  // Search result pages are per-visitor and infinite in number; keeping them
  // out of the index avoids diluting the catalogue pages that should rank.
  robots: { index: false, follow: true },
};

async function SearchResults({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const resolved = await searchParams;
  const query = parseProductQuery(resolved);
  const term = query.search ?? "";

  const [result, rail, allBrands] = await Promise.all([
    listProducts(query),
    getCategoryRail(),
    getBrands(),
  ]);

  return (
    <>
      <Breadcrumb items={[{ label: term ? `"${term}" arama sonuçları` : "Arama" }]} />

      <header className="pb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
          {term ? (
            <>
              <span className="text-ink-500">Arama:</span> {term}
            </>
          ) : (
            "Tüm Ürünler"
          )}
        </h1>
        <p className="mt-2 text-sm text-ink-600 tabular">{result.total} sonuç bulundu</p>
      </header>

      <div className="pb-8">
        <DetailedSearchForm
          categories={rail.tops}
          brands={allBrands.filter((brand) => brand.kind === "manufacturer")}
          initial={{
            term,
            category: query.category,
            brand: query.brand?.[0],
            stockCode: query.stockCode,
            min: query.minPrice ? String(query.minPrice) : "",
            max: query.maxPrice ? String(query.maxPrice) : "",
          }}
        />
      </div>

      <ProductListing
        pathname="/arama"
        searchParams={resolved}
        result={result}
        sort={query.sort ?? "recommended"}
        categoryLinks={rail.tops}
        categoryChildren={rail.childrenBySlug}
        activeCategory={query.category}
        emptyTitle={term ? `"${term}" için sonuç bulunamadı` : "Sonuç bulunamadı"}
        emptyBody="Parça kodunu boşluk veya tire olmadan yazmayı deneyin (örn. SD5S146634). Aradığınızı bulamazsanız WhatsApp'tan yazın, stoğumuzdan birlikte seçelim."
      />
    </>
  );
}

export default function SearchPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <Container>
      {/* The whole page depends on the query, so the boundary wraps everything
          below the shell rather than just the grid. */}
      <Suspense
        fallback={
          <>
            <div className="h-[4.5rem]" />
            <ListingSkeleton />
          </>
        }
      >
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
