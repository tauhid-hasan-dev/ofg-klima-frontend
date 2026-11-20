"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid, type CardLayout } from "@/components/commerce/ProductCard";
import { Button } from "@/components/ui/Button";
import type { ExchangeRates } from "@/lib/currency";
import type { Product } from "@/lib/types";

/**
 * Infinite scroll — requirement 11.
 *
 * "sayfa scrollandığı zaman 2. 3. 4. sayfa istemiyor onun yerine yükleme devam
 * etsin isteniyor." Page 1 is still server-rendered (so the listing is
 * crawlable and the first paint is complete); this component appends the rest
 * as the visitor reaches the bottom.
 *
 * Three things it deliberately does NOT do:
 *
 *  - It never hides a way forward. If the observer never fires — reduced data
 *    mode, a browser without IntersectionObserver, a failed request — the
 *    "Daha fazla ürün yükle" button is a real button that does the same thing.
 *    An infinite list whose only affordance is a scroll event is a dead end
 *    when that event does not arrive.
 *  - It does not rewrite the URL per page. Deep pages stay reachable via
 *    ?sayfa=N for crawlers and for anyone who wants to link one, but scrolling
 *    does not fill the visitor's history with twelve entries they then have to
 *    press Back through.
 *  - It does not convert currency. The rate arrives from the server with the
 *    first page so appended rows are priced identically to the ones above them.
 *
 * Changing a filter does not reset this component's state — it replaces the
 * component. `ProductListing` keys it on the query, so a new filter yields a
 * fresh mount with the new server-rendered first page, and there is no
 * "reconcile props into state" logic here to get subtly wrong.
 */
export function InfiniteProductGrid({
  initialItems,
  initialPage,
  pageCount,
  brandNames,
  rates,
  layout = "grid",
  columns = 4,
  bestSellersOnly = false,
}: {
  initialItems: Product[];
  initialPage: number;
  pageCount: number;
  brandNames: Record<string, string>;
  rates: ExchangeRates;
  layout?: CardLayout;
  columns?: 2 | 3 | 4;
  bestSellersOnly?: boolean;
}) {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  /*
   * Mirrors of the three state values, written only from the async callback
   * below — never during render. They exist so `loadMore` can be a stable
   * callback: if it depended on `page`, the IntersectionObserver would be torn
   * down and rebuilt after every single append.
   */
  const pageRef = useRef(initialPage);
  const loadingRef = useRef(false);
  const failedRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || pageRef.current >= pageCount) return;

    loadingRef.current = true;
    failedRef.current = false;
    setLoading(true);
    setFailed(false);

    try {
      const params = new URLSearchParams(searchKey);
      params.set("sayfa", String(pageRef.current + 1));
      if (bestSellersOnly) params.set("cokSatan", "1");

      const response = await fetch(`/api/urunler?${params.toString()}`);
      if (!response.ok) throw new Error(`Ürünler alınamadı (${response.status})`);

      const data: { items: Product[]; page: number } = await response.json();

      setItems((previous) => {
        // The catalogue can change between requests (a sync, a stock update),
        // which would otherwise duplicate a row across the page boundary.
        const seen = new Set(previous.map((item) => item.id));
        return [...previous, ...data.items.filter((item) => !seen.has(item.id))];
      });
      pageRef.current = data.page;
      setPage(data.page);
    } catch {
      // Leave what is already on screen and surface the retry. Silently
      // stopping looks identical to "you have reached the end", which is the
      // one thing it must not be mistaken for.
      failedRef.current = true;
      setFailed(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [bestSellersOnly, pageCount, searchKey]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Do not auto-retry after a failure: that turns one dead endpoint into
        // a request every time the sentinel scrolls back into view.
        if (entries[0]?.isIntersecting && !failedRef.current) void loadMore();
      },
      // Start fetching before the sentinel is actually visible, so the next
      // rows are usually there by the time the visitor arrives.
      { rootMargin: "800px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const done = page >= pageCount;

  return (
    <>
      <ProductGrid products={items} brandNames={brandNames} rates={rates} layout={layout} columns={columns} />

      <div ref={sentinelRef} aria-hidden="true" className="h-px" />

      <div className="mt-8 flex flex-col items-center gap-3">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-ink-500" role="status">
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-brand-500"
            />
            Ürünler yükleniyor…
          </p>
        ) : null}

        {failed ? (
          <p className="text-sm text-signal-500" role="alert">
            Ürünler yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.
          </p>
        ) : null}

        {!done && !loading ? (
          <Button type="button" variant="outline" onClick={() => void loadMore()}>
            {failed ? "Tekrar dene" : "Daha fazla ürün yükle"}
          </Button>
        ) : null}

        <p className="text-sm text-ink-500 tabular">
          {done ? `${items.length} ürünün tamamı gösteriliyor` : `${items.length} ürün gösteriliyor`}
        </p>
      </div>
    </>
  );
}
