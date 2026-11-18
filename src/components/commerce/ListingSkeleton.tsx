/**
 * Prerendered placeholder for the listing body.
 *
 * With Cache Components enabled, anything that reads `searchParams` is runtime
 * data and must sit behind a Suspense boundary. This is what ships in the
 * static shell, so it mirrors the real layout closely enough that the swap to
 * live results does not shift the page.
 */
/** Breadcrumb + heading placeholder, shown while `params` resolves. */
export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse py-4" aria-hidden="true">
      <div className="h-4 w-56 rounded bg-ink-100" />
      <div className="mt-6 h-8 w-80 rounded bg-ink-200" />
      <div className="mt-4 h-3 w-full max-w-3xl rounded bg-ink-100" />
      <div className="mt-2 mb-6 h-3 w-2/3 max-w-xl rounded bg-ink-100" />
    </div>
  );
}

/** Whole listing page, header included. */
export function ListingPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <ListingSkeleton />
    </>
  );
}

export function ListingSkeleton({ cards = 12 }: { cards?: number }) {
  return (
    <div className="flex items-start gap-6 pb-12" aria-hidden="true">
      <div className="hidden w-[17.5rem] shrink-0 animate-pulse space-y-px overflow-hidden rounded-card bg-white ring-1 ring-ink-200 lg:block">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2.5 border-b border-ink-100 p-4 last:border-b-0">
            <div className="h-3.5 w-28 rounded bg-ink-200" />
            <div className="h-2.5 w-full rounded bg-ink-100" />
            <div className="h-2.5 w-4/5 rounded bg-ink-100" />
            <div className="h-2.5 w-3/5 rounded bg-ink-100" />
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex animate-pulse items-center justify-between rounded-card bg-white p-3 ring-1 ring-ink-200">
          <div className="h-4 w-32 rounded bg-ink-200" />
          <div className="h-10 w-44 rounded bg-ink-100" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: cards }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-card bg-white ring-1 ring-ink-200/70"
            >
              <div className="aspect-square bg-ink-100" />
              <div className="space-y-2.5 p-4">
                <div className="h-2.5 w-16 rounded bg-ink-100" />
                <div className="h-3 w-full rounded bg-ink-200" />
                <div className="h-3 w-3/4 rounded bg-ink-200" />
                <div className="h-5 w-24 rounded bg-ink-200" />
                <div className="h-9 w-full rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
