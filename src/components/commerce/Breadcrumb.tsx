import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@/components/ui/icons";
import { site } from "@/lib/site";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Breadcrumb trail plus its matching `BreadcrumbList` JSON-LD. Emitting both
 * from one component means the visible trail and the structured data can never
 * disagree — which is the usual way breadcrumb rich results break.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: site.url },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        ...(item.href ? { item: `${site.url}${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <nav aria-label="Sayfa yolu" className="py-4">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
          <li className="flex items-center gap-1.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-ink-500 transition-colors hover:text-ink-900"
            >
              <HomeIcon className="h-4 w-4" />
              Anasayfa
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                <ChevronRightIcon className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
                {item.href && !isLast ? (
                  <Link href={item.href} className="text-ink-500 transition-colors hover:text-ink-900">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink-900" aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
