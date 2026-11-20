import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CartButton } from "@/components/layout/CartButton";
import { CategoryMenu, type CategoryNode } from "@/components/layout/CategoryMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchBar, type SearchIndexEntry } from "@/components/layout/SearchBar";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
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
 * Standing entries in the main nav, after the headline categories.
 *
 * Requirement 2 — the client wants both reachable from the top of every page,
 * not just the home page. They sit on the same row as the categories rather
 * than on a band of their own: seven short links read as one menu, where the
 * same seven split across two rows read as two unrelated menus.
 */
const FIXED_NAV = [
  { href: "/cok-satanlar", label: "Çok Satanlar" },
  { href: "/yeni-urunler", label: "Yeni Ürünler" },
] as const;

/**
 * Site header.
 *
 * White throughout, with a hairline between the two rows and under the whole
 * thing — the only separation a white-on-white header can use. The colour it
 * does carry is deliberate and sparse: the navy KATEGORİLER block, which has
 * to read as a button, and the red search button.
 *
 *   row 1   logo, the seven main nav entries, the WhatsApp number
 *   row 2   the KATEGORİLER mega menu, search, basket
 *
 * Below lg the nav collapses into `MobileNav` and search moves to its own row
 * under the logo, where it can be full width.
 *
 * Heights are load-bearing: `--header-h` in globals.css subtracts them from
 * 100dvh to size the hero, and `HeaderHeightSync` corrects it on the client.
 */
export async function Header() {
  const tree = await buildTree();
  const primaryNav = tree.filter((node) => node.category.inMainNav).slice(0, 5);

  const navItems = [
    ...primaryNav.map((node) => ({
      href: `/kategori/${node.category.slug}`,
      label: node.category.shortName ?? node.category.name,
    })),
    ...FIXED_NAV,
  ];

  return (
    /*
     * No rules anywhere in here — not between the rows, not under the header.
     * What stops a white sticky header dissolving into a white listing page
     * once it starts overlapping content is the soft shadow, which separates
     * the two surfaces without drawing a line across the design.
     */
    <header className="sticky top-0 z-50 bg-white shadow-[0_4px_14px_-6px_rgba(20,20,19,0.18)]">
      <Container>
        {/* Row 1 — identity, nav, phone */}
        <div className="flex items-center gap-3 py-3 lg:gap-5">
          <MobileNav tree={tree} />

          <Link href="/" aria-label={`${site.name} ana sayfa`} className="shrink-0">
            {/* Below sm the tagline would be ~4px tall and unreadable, so the
                phone gets the wordmark on its own. */}
            <Logo showTagline={false} priority className="h-9 sm:hidden" />
            <Logo priority className="hidden h-11 sm:block lg:h-12" />
          </Link>

          {/*
            Seven links between a logo and a phone number is tight at lg, so
            everything that costs width is staged: the type and padding step
            up at xl and again at 1400, and the phone number itself only
            appears from xl. Measured at 1024 the row comes to ~860 of the
            960px available, which is the margin this needs to survive a
            category being renamed.
          */}
          <nav aria-label="Ana menü" className="hidden min-w-0 flex-1 lg:block">
            <ul className="flex items-center justify-center gap-0.5 min-[1400px]:gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={NAV_LINK}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0 lg:gap-3">
            <a
              href={whatsappLink(site.whatsapp, "Merhaba, bir ürün hakkında bilgi almak istiyorum.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-ink-200 p-1 transition-colors hover:border-whatsapp min-[360px]:flex xl:pr-4"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-whatsapp text-white">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <span className="hidden font-display text-[0.95rem] font-bold tracking-tight text-ink-950 tabular xl:inline">
                {formatPhone(site.phone)}
              </span>
            </a>

            {/* The basket moves to the action band from lg up, so this copy is
                the phone's only one. */}
            <CartButton className="lg:hidden" />
          </div>
        </div>

        {/* Row 2 (below lg) — search gets the full width it needs on a phone */}
        <div className="pb-5 lg:hidden">
          <SearchBar index={searchIndex} />
        </div>
      </Container>

      {/* ── Action band ───────────────────────────────────────────────
          Also white, and separated from the row above by spacing rather than
          by a rule. The reference puts its search here rather than beside the
          logo, and that is the arrangement kept: it gives the field most of
          the width of the page, which matters on a site where people paste
          14-character OEM codes. */}
      <div className="hidden pb-6 lg:block">
        <Container className="flex items-center gap-5 min-[1400px]:gap-6">
          {/*
            h-12, the same as the search field: the trigger is an outlined box
            now rather than a filled band, and two controls of different
            heights side by side read as a mistake.

            1400px, not xl (1280). Measured: at exactly 1280 the wider trigger
            and the roomier basket label switch on at once and the row
            overflows. Everything that costs width waits for the same
            breakpoint, which is the width where it all actually fits.
          */}
          <div className="h-12 w-[17rem] shrink-0 min-[1400px]:w-[19rem]">
            <CategoryMenu tree={tree} />
          </div>

          <div className="flex min-w-0 flex-1 items-center">
            <SearchBar index={searchIndex} className="w-full" />
          </div>

          <div className="flex shrink-0 items-center">
            <CartButton tone="surface" />
          </div>
        </Container>
      </div>
    </header>
  );
}

/** Main nav link. Dark on white — the header carries no colour of its own. */
const NAV_LINK =
  "block rounded-md px-2 py-2 font-display text-[0.72rem] leading-tight font-bold tracking-tight " +
  "whitespace-nowrap text-ink-800 uppercase transition-colors hover:bg-navy-50 hover:text-navy-600 " +
  "xl:px-2.5 xl:text-[0.8rem] min-[1400px]:px-3 min-[1400px]:text-[0.84rem]";
