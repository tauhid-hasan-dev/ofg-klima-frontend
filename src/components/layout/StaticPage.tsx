import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/commerce/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { staticPages } from "@/lib/data/pages";
import { whatsappLink } from "@/lib/format";
import { site } from "@/lib/site";

/** Builds the `metadata` export for a content page. */
export function staticPageMetadata(slug: string): Metadata {
  const page = staticPages[slug];
  if (!page) return { title: "Sayfa bulunamadı" };

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    ...(page.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function StaticPage({ slug }: { slug: string }) {
  const page = staticPages[slug];
  if (!page) notFound();

  const faqBlock = page.blocks.find((block) => block.type === "faq");

  const faqJsonLd = faqBlock
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqBlock.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }
    : null;

  return (
    <Container>
      <Breadcrumb items={[{ label: page.title }]} />

      <article className="max-w-3xl pb-16">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
          {page.title}
        </h1>

        {page.lead ? (
          <p className="mt-4 border-l-4 border-brand-500 pl-4 text-lg leading-relaxed text-ink-700">{page.lead}</p>
        ) : null}

        <div className="mt-8 space-y-5">
          {page.blocks.map((block, index) => {
            if (block.type === "h2") {
              return (
                <h2
                  key={index}
                  className="pt-3 font-display text-lg font-bold tracking-tight text-ink-950 sm:text-xl"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "ul") {
              return (
                <ul key={index} className="space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[0.95rem] leading-relaxed text-ink-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }

            if (block.type === "faq") {
              return (
                <div key={index} className="divide-y divide-ink-200 overflow-hidden rounded-card ring-1 ring-ink-200">
                  {block.items.map((item) => (
                    <details key={item.q} className="group bg-white">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink-900 marker:hidden hover:bg-ink-50">
                        {item.q}
                        <span
                          aria-hidden="true"
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-100 text-lg leading-none text-ink-600 transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="px-5 pb-5 text-[0.95rem] leading-relaxed text-ink-600">{item.a}</p>
                    </details>
                  ))}
                </div>
              );
            }

            return (
              <p key={index} className="text-[0.95rem] leading-relaxed text-ink-700">
                {block.text}
              </p>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 rounded-card bg-ink-50 p-5 ring-1 ring-ink-200">
          <p className="flex-1 text-sm text-ink-700">
            Sorunuzun yanıtını bulamadınız mı? WhatsApp hattımızdan yazın, hemen dönelim.
          </p>
          <ButtonLink
            href={whatsappLink(site.whatsapp, `Merhaba, "${page.title}" sayfasıyla ilgili bir sorum var.`)}
            external
            variant="whatsapp"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </ButtonLink>
        </div>
      </article>

      {faqJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}
    </Container>
  );
}
