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
 * Çok Satanlar — requirement 2, one of the two entries the client wants fixed
 * at the top of every page.
 *
 * It is a full listing rather than a carousel: once "best seller" is a filter
 * the shopper arrived by, they still want to narrow it by brand, by vehicle
 * and by price, and the shared `ProductListing` already does all of that.
 */

export const metadata: Metadata = {
  title: "Çok Satanlar",
  description: `${site.name} stoklarında en çok tercih edilen oto klima yedek parçaları. Kompresör, kondanser, kasnak seti ve daha fazlası.`,
  alternates: { canonical: "/cok-satanlar" },
};

async function BestSellers({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const resolved = await searchParams;
  const query = parseProductQuery(resolved);

  const [result, rail] = await Promise.all([
    listProducts({ ...query, bestSellersOnly: true }),
    getCategoryRail(),
  ]);

  return (
    <>
      <Breadcrumb items={[{ label: "Çok Satanlar" }]} />

      <header className="pb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
          Çok Satanlar
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
          Servislerin ve bayilerin en sık sipariş verdiği parçalar. Listeyi markaya, araca veya fiyata göre
          daraltabilirsiniz.
        </p>
      </header>

      <ProductListing
        pathname="/cok-satanlar"
        searchParams={resolved}
        result={result}
        sort={query.sort ?? "recommended"}
        categoryLinks={rail.tops}
        categoryChildren={rail.childrenBySlug}
        activeCategory={query.category}
        bestSellersOnly
        emptyTitle="Bu filtrelerle çok satan ürün bulunamadı"
        emptyBody="Filtreleri gevşetmeyi deneyin ya da tüm kataloğa göz atın."
      />
    </>
  );
}

export default function BestSellersPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
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
        <BestSellers searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
