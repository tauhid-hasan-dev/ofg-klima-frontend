import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CartButton } from "@/components/layout/CartButton";
import { CategoryMenu, type CategoryNode } from "@/components/layout/CategoryMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchBar, type SearchIndexEntry } from "@/components/layout/SearchBar";
import { Container } from "@/components/ui/Container";
import { PhoneIcon, TruckIcon, UserIcon, WhatsAppIcon } from "@/components/ui/icons";
import { brands } from "@/lib/data/brands";
import { products } from "@/lib/data/products";
import { formatPhone, whatsappLink } from "@/lib/format";
import { getChildCategories, getTopLevelCategories } from "@/lib/repository";
import { site } from "@/lib/site";

/**
 * The search index is built once at module scope and serialised into the client
 * component. ~115 entries of four short fields is a few KB gzipped — cheaper
 * than an API round-trip on every keystroke, and it keeps suggestions working
 * before the backend exists.
 */
const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));

const searchIndex: SearchIndexEntry[] = products.map((product) => ({
  slug: product.slug,
  name: product.name,
  oem: product.oem,
  brand: brandNames.get(product.brandSlug) ?? product.brandSlug,
}));

async function buildTree(): Promise<CategoryNode[]> {
  const tops = await getTopLevelCategories();
  return Promise.all(
    tops.map(async (category) => ({
      category,
      children: await getChildCategories(category.slug),
    })),
  );
}

/**
 * Standing entries in the red nav strip.
 *
 * "Çok Satanlar" and "Yeni Ürünler" are requirement 2 — the client wants both
 * reachable from the top of every page, not just the home page.
 */
const FIXED_NAV = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/cok-satanlar", label: "Çok Satanlar" },
  { href: "/yeni-urunler", label: "Yeni Ürünler" },
] as const;

export async function Header() {
  const tree = await buildTree();
  const primaryNav = tree.filter((node) => node.category.inMainNav).slice(0, 4);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-ink-950 text-ink-300 lg:block">
        <Container className="flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <TruckIcon className="h-4 w-4 text-brand-400" />
            <span>
              16:00&apos;a kadar verilen siparişler <strong className="font-semibold text-white">aynı gün kargoda</strong>
            </span>
          </p>
          <nav aria-label="Yardımcı bağlantılar" className="flex items-center gap-5">
            <Link href="/siparis-takibi" className="transition-colors hover:text-white">
              Sipariş Takibi
            </Link>
            <Link href="/kargo-ve-teslimat" className="transition-colors hover:text-white">
              Kargo ve Teslimat
            </Link>
            <Link href="/iletisim" className="transition-colors hover:text-white">
              İletişim
            </Link>
            <a href={`tel:${site.phone}`} className="flex items-center gap-1.5 font-semibold text-white">
              <PhoneIcon className="h-3.5 w-3.5 text-brand-400" />
              {formatPhone(site.phone)}
            </a>
          </nav>
        </Container>
      </div>

      {/*
        Identity band.
        White rather than brand-coloured: the red is a dark surface, and a full
        red band behind the logo, the search field and the account links left
        every one of them fighting the background for attention.
      */}
      <div className="border-b border-ink-200 bg-white">
        <Container>
          {/* Row 1 — identity, search, account */}
          <div className="flex items-center gap-3 py-3 lg:gap-6">
            <MobileNav tree={tree} />

            <Link href="/" aria-label={`${site.name} ana sayfa`} className="shrink-0">
              {/* Below sm the tagline would be ~4px tall and unreadable, so the
                  phone gets the wordmark on its own. */}
              <Logo showTagline={false} priority className="h-9 sm:hidden" />
              <Logo priority className="hidden h-11 sm:block lg:h-12" />
            </Link>

            {/* Search owns the middle of the row from lg up; below that it
                moves to its own row so the logo keeps its size. */}
            <SearchBar index={searchIndex} className="hidden min-w-0 flex-1 lg:block" />

            <div className="ml-auto flex shrink-0 items-center gap-2 lg:gap-3">
              <a
                href={whatsappLink(site.whatsapp, "Merhaba, bir ürün hakkında bilgi almak istiyorum.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-full border border-ink-200 p-1 transition-colors hover:border-whatsapp min-[360px]:flex sm:pr-4"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-whatsapp text-white">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span className="hidden font-display text-[0.95rem] font-bold tracking-tight text-ink-950 tabular sm:inline">
                  {formatPhone(site.phone)}
                </span>
              </a>

              <span aria-hidden="true" className="hidden h-7 w-px bg-ink-200 lg:block" />

              <Link
                href="/hesap"
                className="hidden items-center gap-2 rounded-md px-2 py-2 text-ink-800 transition-colors hover:text-brand-600 lg:flex"
              >
                <UserIcon className="h-6 w-6" />
                <span className="text-sm font-semibold">Üye Girişi</span>
              </Link>

              <CartButton />
            </div>
          </div>

          {/* Row 2 (below lg) — search gets the full width it needs on a phone */}
          <div className="pb-3 lg:hidden">
            <SearchBar index={searchIndex} />
          </div>
        </Container>
      </div>

      {/*
        Nav strip.
        `overflow-x-auto` plus `whitespace-nowrap` on each item is what stops
        the old two-line wrap: between 1024px and ~1200px the labels no longer
        fit, and a horizontal scroll is honest where a ragged second line of
        half-broken category names was not.
      */}
      <div className="on-brand hidden bg-brand-500 shadow-[0_1px_0_rgba(20,20,19,0.18)] lg:block">
        <Container className="flex h-12 items-stretch">
          {/*
            1400px, not xl (1280). Measured: at exactly 1280 the wider trigger,
            the roomier link padding and the fourth category all switch on at
            once and the row overflows by ~60px. Everything that costs width
            waits for the same breakpoint, which is the width where it all
            actually fits.
          */}
          <div className="w-56 shrink-0 min-[1400px]:w-[19rem]">
            <CategoryMenu tree={tree} />
          </div>

          <nav aria-label="Ana menü" className="min-w-0 flex-1">
            <ul className="scrollbar-none flex h-full items-stretch overflow-x-auto pl-3 min-[1400px]:pl-4">
              {FIXED_NAV.map((item) => (
                <li key={item.href} className="flex">
                  <Link href={item.href} className={NAV_LINK}>
                    {item.label}
                  </Link>
                </li>
              ))}

              {primaryNav.map((node, position) => (
                <li
                  key={node.category.slug}
                  /*
                   * The fourth category only appears once there is room for it.
                   * Below 1400px the row is ~100px short, and showing one
                   * category fewer is better than leaving a half-cut word at
                   * the right edge — the mega menu one block to the left has
                   * every category in it anyway.
                   */
                  className={position === 3 ? "hidden min-[1400px]:flex" : "flex"}
                >
                  <Link href={`/kategori/${node.category.slug}`} className={NAV_LINK}>
                    {node.category.shortName ?? node.category.name}
                  </Link>
                </li>
              ))}

              <li className="flex">
                <Link href="/iletisim" className={NAV_LINK}>
                  İletişim
                </Link>
              </li>
            </ul>
          </nav>
        </Container>
      </div>
    </header>
  );
}

const NAV_LINK =
  "flex items-center whitespace-nowrap border-b-[3px] border-transparent px-2.5 font-display " +
  "text-[0.78rem] font-bold tracking-wide text-white uppercase transition-colors " +
  "hover:border-white hover:bg-brand-600 min-[1400px]:px-4 min-[1400px]:text-[0.82rem]";
