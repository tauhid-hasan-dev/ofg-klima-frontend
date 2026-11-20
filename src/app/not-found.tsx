import { QuickLinks } from "@/components/commerce/ProductListing";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <Container>
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="font-display text-7xl font-extrabold tracking-tight text-brand-500 tabular sm:text-8xl">404</p>

        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink-950">
          Aradığınız sayfa bulunamadı
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-600">
          Bağlantı değişmiş ya da ürün kataloğdan kaldırılmış olabilir. Parça kodu ile arama yaparak aradığınıza
          ulaşabilirsiniz.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/arama" size="lg">
            <SearchIcon className="h-5 w-5" />
            Ürün Ara
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            Anasayfaya Dön
          </ButtonLink>
        </div>

        <div className="mt-10">
          <p className="mb-3 text-sm font-semibold text-ink-500">Popüler kategoriler</p>
          <QuickLinks
            items={[
              { label: "Klima Kompresörü", href: "/kategori/klima-kompresoru" },
              { label: "Klima Radyatörü", href: "/kategori/klima-radyatoru" },
              { label: "Kasnak Seti", href: "/kategori/klima-kasnak-seti" },
              { label: "Oto Klima Gazı", href: "/kategori/oto-klima-gazi" },
              { label: "Tüm Markalar", href: "/marka" },
            ]}
          />
        </div>
      </div>
    </Container>
  );
}
