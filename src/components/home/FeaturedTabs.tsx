"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/commerce/ProductCard";
import type { Product } from "@/lib/types";
import { clsx } from "@/lib/utils";

export interface FeaturedGroup {
  slug: string;
  title: string;
  products: Product[];
}

/**
 * "ÖNE ÇIKAN ÜRÜNLER" with pill tabs.
 *
 * The reference site puts one section header beside a row of pills rather than
 * stacking three separate product sections — it keeps the fold short while
 * still surfacing all three ranges. Every group is rendered and toggled with
 * `hidden`, not unmounted, so switching tabs costs nothing and all products
 * remain in the server-rendered HTML for crawlers.
 */
export function FeaturedTabs({
  groups,
  brandNames,
}: {
  groups: FeaturedGroup[];
  brandNames: Record<string, string>;
}) {
  const [active, setActive] = useState(groups[0]?.slug ?? "");

  if (groups.length === 0) return null;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-4">
        <h2 className="relative shrink-0 pb-3 font-display text-xl font-extrabold tracking-tight uppercase sm:text-2xl">
          Öne Çıkan Ürünler
          <span aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-16 bg-brand-500" />
        </h2>

        <div role="tablist" aria-label="Öne çıkan ürün grupları" className="flex flex-wrap gap-2">
          {groups.map((group) => {
            const isActive = group.slug === active;
            return (
              <button
                key={group.slug}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`featured-${group.slug}`}
                id={`tab-${group.slug}`}
                onClick={() => setActive(group.slug)}
                className={clsx(
                  "rounded-full border px-5 py-2.5 text-sm font-bold transition-colors",
                  isActive
                    ? "border-signal-500 bg-white text-signal-500"
                    : "border-transparent bg-ink-100 text-ink-700 hover:bg-ink-200",
                )}
              >
                {group.title}
              </button>
            );
          })}
        </div>
      </div>

      {groups.map((group) => (
        <div
          key={group.slug}
          id={`featured-${group.slug}`}
          role="tabpanel"
          aria-labelledby={`tab-${group.slug}`}
          hidden={group.slug !== active}
        >
          <ProductGrid products={group.products} brandNames={brandNames} />
        </div>
      ))}
    </section>
  );
}
