import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/commerce/Breadcrumb";
import { DetailedSearchForm } from "@/components/commerce/DetailedSearchForm";
import { ListingPageSkeleton, ListingSkeleton } from "@/components/commerce/ListingSkeleton";
import { ProductListing } from "@/components/commerce/ProductListing";
import { Container } from "@/components/ui/Container";
import { getBrands, getTopLevelCategories, listProducts } from "@/lib/repository";
import { parseProductQuery, type RawSearchParams } from "@/lib/search-params";

/**
 * `/arama/<terim>` — keyword in the path, filters in the query.
 *
 * This mirrors the client's URL scheme (`.../arama/COROLLA`). Having the term
 * in the path matters to them: those URLs get shared with customers over
 * WhatsApp, and a bare `?q=` tail reads as noise next to a part number.
 */
interface PageProps {
  params: Promise<{ terim: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { terim } = await params;
  const term = decodeURIComponent(terim);
  return {
    title: `"${term}" arama sonuçları`,
    // Per-visitor, effectively infinite; keep them out of the index.
    robots: { index: false, follow: true },
  };
}

async function Results({ params, searchParams }: PageProps) {
  const { terim } = await params;
  const resolved = await searchParams;
  const term = decodeURIComponent(terim);

  const query = parseProductQuery({ ...resolved, q: term });
  const [result, categories, brands] = await Promise.all([
    listProducts(query),
    getTopLevelCategories(),
    getBrands(),
  ]);

  return (
    <>
      <Breadcrumb items={[{ label: "Arama", href: "/arama" }, { label: term }]} />

      <header className="pb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
          <span className="text-ink-500">Arama:</span> {term}
        </h1>
        <p className="mt-2 text-sm text-ink-600 tabular">{result.total} sonuç bulundu</p>
      </header>

      <div className="pb-8">
        <DetailedSearchForm
          categories={categories}
          brands={brands.filter((brand) => brand.kind === "manufacturer")}
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
        pathname={`/arama/${terim}`}
        searchParams={resolved}
        result={result}
        sort={query.sort ?? "recommended"}
        categoryLinks={categories}
        emptyTitle={`"${term}" için sonuç bulunamadı`}
        emptyBody="Parça kodunu boşluk veya tire olmadan yazmayı deneyin (örn. SD5S146634). Stok kodu ile de arayabilirsiniz."
      />
    </>
  );
}

export default function SearchTermPage({ params, searchParams }: PageProps) {
  return (
    <Container>
      <Suspense
        fallback={
          <>
            <ListingPageSkeleton />
            <ListingSkeleton cards={0} />
          </>
        }
      >
        <Results params={params} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
