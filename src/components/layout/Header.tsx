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

export async function Header() {
  const tree = await buildTree();
  const primaryNav = tree.filter((node) => node.category.inMainNav).slice(0, 5);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-ink-950 text-ink-200 lg:block">
        <Container className="flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <TruckIcon className="h-4 w-4 text-brand-400" />
            <span>
              16:00&apos;a kadar verilen siparişler <strong className="font-semibold text-white">aynı gün kargoda</strong>
            </span>
          </p>
          <nav aria-label="Yardımcı bağlantılar" className="flex items-center gap-5">
            <Link href="/siparis-takibi" className="transition-colors hover:text-brand-400">
              Sipariş Takibi
            </Link>
            <Link href="/kargo-ve-teslimat" className="transition-colors hover:text-brand-400">
              Kargo ve Teslimat
            </Link>
            <Link href="/iletisim" className="transition-colors hover:text-brand-400">
              İletişim
            </Link>
            <a href={`tel:${site.phone}`} className="flex items-center gap-1.5 font-semibold text-white">
              <PhoneIcon className="h-3.5 w-3.5 text-brand-400" />
              {formatPhone(site.phone)}
            </a>
          </nav>
        </Container>
      </div>

      {/* Brand band */}
      <div className="on-brand bg-brand-400 shadow-[0_1px_0_rgba(20,20,19,0.12)]">
        <Container>
          {/* Row 1 — identity, section nav, direct contact */}
          <div className="flex items-center gap-3 py-2.5 lg:gap-8">
            <MobileNav tree={tree} />

            <Link href="/" aria-label={`${site.name} ana sayfa`} className="shrink-0">
              <Logo tone="onBrand" />
            </Link>

            <nav aria-label="Ana kategoriler" className="hidden min-w-0 flex-1 lg:block">
              <ul className="flex items-center justify-start gap-6 xl:gap-8">
                {primaryNav.map((node) => (
                  <li key={node.category.slug}>
                    <Link
                      href={`/kategori/${node.category.slug}`}
                      className="block max-w-[9rem] border-b-2 border-transparent pb-0.5 font-display text-[0.8rem] leading-tight font-bold tracking-tight text-ink-950 uppercase transition-colors hover:border-ink-950"
                    >
                      {node.category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              {/* Collapses to the green circle alone below sm. Hidden
                  entirely under 360px, where logo + hamburger + cart already
                  use the full row — the floating button and the drawer still
                  offer WhatsApp there. */}
              <a
                href={whatsappLink(site.whatsapp, "Merhaba, bir ürün hakkında bilgi almak istiyorum.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-full bg-white p-1.5 shadow-card transition-transform hover:-translate-y-px min-[360px]:flex sm:pr-4"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-whatsapp text-white">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span className="hidden font-display text-[0.95rem] font-bold tracking-tight text-ink-950 tabular sm:inline">
                  {formatPhone(site.phone)}
                </span>
              </a>

              <div className="lg:hidden">
                <CartButton />
              </div>
            </div>
          </div>

          {/* Row 2 — catalogue entry points */}
          <div className="flex items-center gap-3 pb-3 lg:gap-5">
            <div className="hidden w-[19rem] shrink-0 lg:block">
              <CategoryMenu tree={tree} />
            </div>

            <SearchBar index={searchIndex} className="min-w-0 flex-1" />

            <div className="hidden items-center gap-1 lg:flex">
              <Link
                href="/hesap"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-ink-950 transition-colors hover:bg-ink-950/10"
              >
                <UserIcon className="h-6 w-6" />
                <span className="text-sm font-semibold">Üye Girişi</span>
              </Link>
              <span aria-hidden="true" className="h-6 w-px bg-ink-950/20" />
              <CartButton />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
