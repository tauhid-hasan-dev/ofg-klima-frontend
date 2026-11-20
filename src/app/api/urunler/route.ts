import { connection, NextResponse, type NextRequest } from "next/server";
import { getRates } from "@/lib/currency";
import { getBrandsWithCounts, listProducts } from "@/lib/repository";
import { parseProductQuery, type RawSearchParams } from "@/lib/search-params";

/**
 * Paged product feed for the infinite-scroll grid (requirement 11).
 *
 * It takes the same querystring the listing pages do, so "load the next page"
 * is literally "ask for the same thing with sayfa=N+1" — the filters, the
 * sort and the search term all keep working while scrolling, with no second
 * parameter format to keep in sync.
 *
 * `rates` rides along with the items on purpose. The TCMB rate lives in a
 * server-side cache; the client appends these rows into a grid whose first
 * page was priced on the server, and sending the rate is what stops row 25
 * from being converted at a different number than row 24.
 */

/*
 * No `export const dynamic` here: it is incompatible with Next's Cache
 * Components. `await connection()` is the supported way to say "this runs
 * per request" — it marks everything after it as request-time work.
 */

/** Hard ceiling so a hand-edited URL cannot ask for the whole catalogue. */
const MAX_PER_PAGE = 48;

export async function GET(request: NextRequest) {
  await connection();
  const raw: RawSearchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  const query = parseProductQuery(raw);
  // Set by the page, not the visitor — /cok-satanlar passes it through.
  const bestSellersOnly = raw.cokSatan === "1";

  const [result, brands] = await Promise.all([
    listProducts({
      ...query,
      bestSellersOnly,
      perPage: Math.min(query.perPage ?? 24, MAX_PER_PAGE),
    }),
    getBrandsWithCounts(),
  ]);

  const brandNames = Object.fromEntries(brands.map((brand) => [brand.slug, brand.name]));

  return NextResponse.json({
    items: result.items,
    page: result.page,
    pageCount: result.pageCount,
    total: result.total,
    brandNames,
    rates: getRates(),
  });
}
