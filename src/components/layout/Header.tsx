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
 * Standing entries on the navy band, beside the account and basket controls.
 *
 * "Çok Satanlar" and "Yeni Ürünler" are requirement 2 — the client wants both
 * reachable from the top of every page, not just the home page.
 */
const FIXED_NAV = [
  { href: "/cok-satanlar", label: "Çok Satanlar" },
  { href: "/yeni-urunler", label: "Yeni Ürünler" },
] as const;

/**
 * Site header.
 *
 * Three bands, following the reference storefront:
 *
 *   utility   navy-950, lg only — order tracking, delivery, phone
 *   identity  white — logo, the five headline categories, the WhatsApp number
 *   action    navy-600, lg only — the KATEGORİLER mega menu, search, the
 *             standing links, account and basket
 *
 * The reference puts its search in the coloured band rather than beside the
 * logo, and that is the arrangement copied here: it gives the field most of
 * the width of the page, which matters on a site where people paste
 * 14-character OEM codes.
 *
 * Below lg the action band collapses — the mega menu becomes the drawer in
 * `MobileNav`, and search moves to its own row under the logo where it can be
 * full width.
 *
 * Heights are load-bearing: `--header-h` in globals.css subtracts them from
 * 100dvh to size the hero. Changing a band's height means changing that too.
 */
export async function Header() {
  const tree = await buildTree();
  const primaryNav = tree.filter((node) => node.category.inMainNav).slice(0, 5);

  return (
    <header className="sticky top-0 z-50">
      {/* ── Utility bar ──────────────────────────────────────────── */}
      <div className="hidden bg-navy-950 text-navy-200 lg:block">
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
        ── Identity band ───────────────────────────────────────────
        White, not navy: the logo's own letterforms are navy, and on a navy
        band the wordmark lost its edges against the background.
      */}
      <div className="border-b border-ink-200 bg-white">
        <Container>
          {/* Row 1 — identity, headline categories, phone */}
          <div className="flex items-center gap-3 py-3 lg:gap-6">
            <MobileNav tree={tree} />

            <Link href="/" aria-label={`${site.name} ana sayfa`} className="shrink-0">
              {/* Below sm the tagline would be ~4px tall and unreadable, so the
                  phone gets the wordmark on its own. */}
              <Logo showTagline={false} priority className="h-9 sm:hidden" />
              <Logo priority className="hidden h-11 sm:block lg:h-12" />
            </Link>

            {/*
              The five headline categories as plain text links, as on the
              reference. They appear only at xl: between lg and xl the row is
              ~90px short of fitting them between the logo and the phone
              number, and the same five sit one click away in the mega menu
              directly below.
            */}
            <nav aria-label="Öne çıkan kategoriler" className="hidden min-w-0 flex-1 xl:block">
              <ul className="flex items-center justify-center gap-1">
                {primaryNav.map((node) => (
                  <li key={node.category.slug}>
                    <Link href={`/kategori/${node.category.slug}`} className={TOP_LINK}>
                      {node.category.shortName ?? node.category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

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

              {/* Account and basket move to the navy band from lg up, so this
                  copy of the basket is the phone's only one. */}
              <CartButton className="lg:hidden" />
            </div>
          </div>

          {/* Row 2 (below lg) — search gets the full width it needs on a phone */}
          <div className="pb-3 lg:hidden">
            <SearchBar index={searchIndex} />
          </div>
        </Container>
      </div>

      {/*
        ── Action band ─────────────────────────────────────────────
        Navy — the logo's own blue, and the single largest block of brand
        colour on the page. Carries the three controls that do the most work
        on a parts catalogue: the category tree, search, and the basket.
      */}
      <div className="on-brand hidden bg-navy-600 shadow-[0_1px_0_rgba(17,16,42,0.25)] lg:block">
        <Container className="flex h-14 items-stretch gap-4">
          {/*
            1400px, not xl (1280). Measured: at exactly 1280 the wider trigger
            and the "Üye Girişi" label switch on at once and the row overflows
            by ~60px. Everything that costs width waits for the same
            breakpoint, which is the width where it all actually fits.
          */}
          <div className="w-[17rem] shrink-0 min-[1400px]:w-[19rem]">
            <CategoryMenu tree={tree} />
          </div>

          <div className="flex min-w-0 flex-1 items-center">
            <SearchBar index={searchIndex} className="w-full" />
          </div>

          <nav aria-label="Hesap ve sepet" className="flex shrink-0 items-center gap-1">
            {FIXED_NAV.map((item) => (
              <Link key={item.href} href={item.href} className={STRIP_LINK}>
                {item.label}
              </Link>
            ))}

            <span aria-hidden="true" className="mx-1 h-6 w-px bg-white/25" />

            <Link href="/hesap" className={STRIP_LINK}>
              <UserIcon className="h-5 w-5" />
              <span className="hidden min-[1400px]:inline">Üye Girişi</span>
            </Link>

            <CartButton tone="light" />
          </nav>
        </Container>
      </div>
    </header>
  );
}

/** Headline category link in the white identity row. */
const TOP_LINK =
  "block rounded-md px-2.5 py-2 font-display text-[0.82rem] leading-tight font-bold tracking-tight " +
  "whitespace-nowrap text-ink-800 uppercase transition-colors hover:bg-navy-50 hover:text-navy-600";

/** Link on the navy action band. */
const STRIP_LINK =
  "flex items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-2 font-display text-[0.78rem] " +
  "font-bold tracking-wide text-white uppercase transition-colors hover:bg-white/15 " +
  "min-[1400px]:px-3 min-[1400px]:text-[0.8rem]";
