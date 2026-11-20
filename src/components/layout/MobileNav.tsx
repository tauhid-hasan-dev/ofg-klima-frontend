"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import type { CategoryNode } from "@/components/layout/CategoryMenu";
import { ChevronDownIcon, CloseIcon, MenuIcon, PhoneIcon, UserIcon, WhatsAppIcon } from "@/components/ui/icons";
import { formatPhone, whatsappLink } from "@/lib/format";
import { site } from "@/lib/site";
import { clsx } from "@/lib/utils";

/**
 * Mobile navigation drawer. Opens from the left, traps scroll while open, and
 * closes automatically on route change so the back button behaves.
 */
export function MobileNav({ tree }: { tree: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  /**
   * Close on navigation.
   *
   * This deliberately does NOT use `usePathname()`. The drawer lives in the
   * root layout, so a URL-data dependency here propagates to every route —
   * and on routes without `generateStaticParams` (e.g. /arama/[terim]) it
   * blocks the static shell entirely. Listening for a link click inside the
   * drawer achieves the same thing with no such coupling.
   */
  function closeIfLinkClicked(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a")) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        aria-expanded={open}
        className="grid h-11 w-11 place-items-center rounded-md text-ink-950 transition-colors hover:bg-ink-950/10 lg:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menüsü"
            className="absolute inset-y-0 left-0 flex w-[min(21rem,85vw)] flex-col bg-white shadow-menu"
            onClick={closeIfLinkClicked}
          >
            <div className="on-brand flex items-center justify-between gap-3 bg-brand-500 px-4 py-3">
              <Link href="/" onClick={() => setOpen(false)}>
                <Logo tone="onBrand" showTagline={false} className="h-8" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Menüyü kapat"
                className="grid h-10 w-10 place-items-center rounded-md text-white transition-colors hover:bg-white/15"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain py-2" aria-label="Kategoriler">
              {tree.map((node) => {
                const isExpanded = expanded === node.category.slug;
                const hasChildren = node.children.length > 0;

                return (
                  <div key={node.category.slug} className="border-b border-ink-100 last:border-b-0">
                    <div className="flex items-stretch">
                      <Link
                        href={`/kategori/${node.category.slug}`}
                        className="flex-1 px-4 py-3.5 text-[0.95rem] font-semibold text-ink-900"
                      >
                        {node.category.name}
                      </Link>
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : node.category.slug)}
                          aria-expanded={isExpanded}
                          aria-label={`${node.category.name} alt kategorileri`}
                          className="grid w-12 place-items-center border-l border-ink-100 text-ink-500"
                        >
                          <ChevronDownIcon
                            className={clsx("h-5 w-5 transition-transform duration-200", isExpanded && "rotate-180")}
                          />
                        </button>
                      ) : null}
                    </div>

                    {hasChildren && isExpanded ? (
                      <ul className="bg-ink-50 pb-2">
                        {node.children.map((child) => (
                          <li key={child.slug}>
                            <Link
                              href={`/kategori/${child.slug}`}
                              className="block py-2.5 pr-4 pl-8 text-sm text-ink-700"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}

              <div className="mt-2 border-t-4 border-ink-100">
                {[
                  { href: "/cok-satanlar", label: "Çok Satanlar" },
                  { href: "/yeni-urunler", label: "Yeni Ürünler" },
                  { href: "/marka", label: "Tüm Markalar" },
                  { href: "/hakkimizda", label: "Hakkımızda" },
                  { href: "/iletisim", label: "İletişim" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3.5 text-[0.95rem] font-semibold text-ink-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="space-y-2 border-t border-ink-200 p-4">
              <Link
                href="/hesap"
                className="flex h-11 items-center justify-center gap-2 rounded-md border border-ink-300 text-sm font-semibold text-ink-800"
              >
                <UserIcon className="h-5 w-5" />
                Üye Girişi
              </Link>
              <a
                href={whatsappLink(site.whatsapp, "Merhaba, bir ürün hakkında bilgi almak istiyorum.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-md bg-whatsapp text-sm font-semibold text-white"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp Destek
              </a>
              <a
                href={`tel:${site.phone}`}
                className="flex h-11 items-center justify-center gap-2 rounded-md bg-ink-950 text-sm font-semibold text-white"
              >
                <PhoneIcon className="h-4 w-4" />
                {formatPhone(site.phone)}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
