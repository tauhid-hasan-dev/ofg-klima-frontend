import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ActivityChart } from "@/components/admin/ActivityChart";
import { CityDensity } from "@/components/admin/CityDensity";
import { StatTile } from "@/components/admin/StatTile";
import { Container } from "@/components/ui/Container";
import { summarise } from "@/lib/analytics/store";
import { formatDate } from "@/lib/format";

/**
 * Yönetim paneli — requirement 16.
 *
 * Answers the four questions the client listed, in the order they asked them:
 * which words are searched and how often, which products people look at before
 * going to WhatsApp, how activity moves day by day, and where visits come from.
 *
 * ## Access
 *
 * This page is noindex and nofollow, and that is all it is today. It must be
 * put behind authentication before the site goes live — the data is not
 * personal, but it is commercially sensitive, and "nobody will guess the URL"
 * is not access control. The natural place is middleware, once the client
 * decides who should be able to see it.
 */

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

/*
 * The dashboard reads a log file and groups it by day, so it is request-time
 * work by nature. `await connection()` in `Dashboard` says so; a route-level
 * `export const dynamic` is not compatible with Cache Components.
 */

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-white p-5 ring-1 ring-ink-200">
      <h2 className="font-display text-base font-bold tracking-wide text-ink-950 uppercase">{title}</h2>
      {note ? <p className="mt-1 text-xs leading-relaxed text-ink-500">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-ink-400">{children}</p>;
}

async function Dashboard() {
  await connection();
  const summary = await summarise(30, 20);

  const conversion =
    summary.totals.productViews > 0
      ? Math.round((summary.totals.whatsapp / summary.totals.productViews) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-16">
      <header>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">
          Yönetim Paneli
        </h1>
        <p className="mt-2 text-sm text-ink-600">
          {formatDate(summary.range.from)} – {formatDate(summary.range.to)} arası son {summary.range.days} gün.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Sayfa görüntüleme" value={summary.totals.pageViews} />
        <StatTile label="Arama" value={summary.totals.searches} />
        <StatTile label="Ürün görüntüleme" value={summary.totals.productViews} />
        <StatTile
          label="WhatsApp'a geçiş"
          value={summary.totals.whatsapp}
          hint={summary.totals.productViews > 0 ? `Ürün görüntülemenin %${conversion}'i` : undefined}
          accent
        />
      </div>

      <Panel
        title="Günlük hareket"
        note="Sipariş cirosu, ödeme altyapısı bağlandığında bu grafiğe eklenecek. Şu an sipariş sinyali olarak WhatsApp'a geçiş sayılıyor."
      >
        <ActivityChart data={summary.daily} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="En çok aranan kelimeler"
          note="Yazıldığı gibi listelenir; yazım hataları da görünür — &ldquo;kasnak&rdquo; yerine &ldquo;kanak&rdquo; arayanlar burada çıkar."
        >
          {summary.topSearches.length === 0 ? (
            <EmptyNote>Henüz arama kaydı yok.</EmptyNote>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-xs font-semibold tracking-wide text-ink-500 uppercase">
                  <th scope="col" className="pb-2">Kelime</th>
                  <th scope="col" className="pb-2 text-right">Sıklık</th>
                </tr>
              </thead>
              <tbody>
                {summary.topSearches.map((row) => (
                  <tr key={row.term} className="border-b border-ink-100 last:border-b-0">
                    <td className="py-2 text-ink-800">{row.term}</td>
                    <td className="py-2 text-right font-semibold text-ink-950 tabular">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel
          title="En çok WhatsApp'a geçilen ürünler"
          note="WhatsApp'a geçiş sayısına göre sıralanır. Çok görüntülenip hiç sorulmayan ürün, çok sorulan üründen farklı bir şey anlatır."
        >
          {summary.topProducts.length === 0 ? (
            <EmptyNote>Henüz ürün kaydı yok.</EmptyNote>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-xs font-semibold tracking-wide text-ink-500 uppercase">
                  <th scope="col" className="pb-2">Ürün</th>
                  <th scope="col" className="pb-2 text-right">Görüntüleme</th>
                  <th scope="col" className="pb-2 text-right">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {summary.topProducts.map((row) => (
                  <tr key={row.productId} className="border-b border-ink-100 last:border-b-0">
                    <td className="max-w-0 truncate py-2 pr-3 text-ink-800" title={row.productName}>
                      {row.productName}
                    </td>
                    <td className="py-2 text-right text-ink-600 tabular">{row.views}</td>
                    <td className="py-2 text-right font-semibold text-brand-600 tabular">{row.whatsapp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      <Panel
        title="Şehirlere göre ziyaret yoğunluğu"
        note="Şehir, CDN'in coğrafi başlığından okunur; IP adresi ne kaydedilir ne de saklanır. İsim, soyisim veya kullanıcı kimliği tutulmaz."
      >
        <CityDensity cities={summary.cities} />
      </Panel>

      <p className="rounded-card bg-ink-50 p-4 text-xs leading-relaxed text-ink-600 ring-1 ring-ink-200">
        <strong className="font-semibold text-ink-900">KVKK notu:</strong> Bu panel yalnızca sayaç tutar. Hiçbir
        olayda isim, soyisim, e-posta, telefon, IP adresi veya oturumlar arası takip kimliği saklanmaz; kaydedilen
        tek konum bilgisi şehir adıdır. Kişisel veri işlenmediği için silinecek, dışa aktarılacak ya da sızabilecek
        bir kayıt da yoktur.
      </p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Container className="pt-8">
      <Suspense fallback={<p className="py-20 text-center text-sm text-ink-400">Veriler yükleniyor…</p>}>
        <Dashboard />
      </Suspense>
    </Container>
  );
}
