# OFG — Oto Klima Yedek Parça

Oto klima yedek parça e-ticaret arayüzü — **frontend only**.
Turkish auto A/C spare-parts storefront, built with Next.js 16 (App Router), React 19 and Tailwind CSS v4.

> Referans alınan site / Modelled on: [kafkasotoofgca.com](https://www.kafkasotoofgca.com)
> Müşteri brief'i / Client brief: [`docs/VIDEO-INSTRUCTIONS.md`](docs/VIDEO-INSTRUCTIONS.md)

---

## Başlangıç / Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu (Turbopack) |
| `npm run build` | Üretim derlemesi |
| `npm start` | Derlenmiş uygulamayı çalıştırır |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Node 20+ gerekir (geliştirildiği sürüm: 24).

---

## Mimari / Architecture

```
src/
├── app/                      Rotalar (App Router)
│   ├── page.tsx              Anasayfa
│   ├── marka/                /marka  ·  /marka/[slug]
│   ├── kategori/[slug]/      Kategori listeleme
│   ├── urun/[slug]/          Ürün detay
│   ├── arama/                Arama sonuçları
│   ├── sepet/                Sepet
│   ├── iletisim/             İletişim + form
│   ├── <11 statik sayfa>/    Kurumsal ve hukuki sayfalar
│   ├── sitemap.ts, robots.ts
│   └── globals.css           Tailwind v4 @theme tokenları
│
├── components/
│   ├── brand/                Logo
│   ├── layout/               Header, mega menü, mobil çekmece, footer, arama
│   ├── commerce/             Ürün kartı, filtreler, sıralama, sayfalama, sepet
│   └── ui/                   Button, Container, ikonlar
│
└── lib/
    ├── types.ts              Alan modeli (tek doğruluk kaynağı)
    ├── repository.ts         ⬅ VERİ ERİŞİM KATMANI — backend buraya bağlanır
    ├── data/                 Statik fixture'lar (yalnızca repository okur)
    ├── store/cart.tsx        localStorage tabanlı sepet
    ├── search-params.ts      Querystring ↔ ProductQuery
    ├── format.ts             TL / tarih / telefon biçimleme
    └── site.ts               Firma bilgileri, footer menüleri
```

### Tek kural / The one rule

**`src/app` ve `src/components` altındaki hiçbir dosya `src/lib/data`'dan içe aktarım yapmaz.**
Tüm veri `src/lib/repository.ts` üzerinden akar. Backend geldiğinde değişmesi gereken tek dosya budur.

---

## Backend'i bağlamak / Wiring up the backend

`src/lib/repository.ts` içindeki her fonksiyon zaten `async`'tir. Gövdeyi değiştirmeniz yeterli:

```ts
// Şimdi / now — in-memory fixture
export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

// Sonra / later — real API
export async function getProduct(slug: string): Promise<Product | undefined> {
  const res = await fetch(`${process.env.API_URL}/products/${slug}`, {
    next: { revalidate: 300 },
  });
  return res.ok ? res.json() : undefined;
}
```

> **Cache Components açık.** `next.config.ts` içinde `cacheComponents: true` etkindir. Bir sunucu
> bileşeni önbelleğe alınmamış veri (`fetch`, veritabanı) ya da `params` / `searchParams` okuyorsa
> **ya `<Suspense>` içinde olmalı ya da `"use cache"` ile işaretlenmelidir.** Listeleme sayfaları
> bu desene göre yazılmıştır: statik kabuk anında gelir, sonuçlar akış hâlinde yüklenir.

Ayrıca değiştirilmesi gerekenler:
- `src/lib/site.ts` — firma adı, adres, telefon, WhatsApp numarası, alan adı
- `src/app/sepet/page.tsx` — sepet şu an tüm kataloğu istemciye gönderir; API gelince
  satır id'lerini POST eden bir uca çevirin
- `src/components/layout/ContactForm.tsx` — şu an WhatsApp'a yönlendirir; `POST /contact` yapın
- `src/components/layout/Header.tsx` — arama indeksi modül kapsamında üretilir; katalog büyüyünce
  `/api/suggest` ucuna taşıyın

---

## Tasarım sistemi / Design system

Tüm tokenlar `src/app/globals.css` içindeki `@theme` bloğundadır (Tailwind v4 — ayrı config dosyası yok).

| Token | Değer | Kullanım |
|---|---|---|
| `brand-400` | `#ffd400` | Başlık bandı, birincil buton |
| `ink-950` | `#0a0a09` | Metin, koyu yüzeyler |
| `signal-500` | `#d7263d` | İndirim, hata, filtre temizleme |
| `whatsapp` | `#25d366` | WhatsApp aksiyonları |
| `stock-in/low/out` | yeşil / amber / kırmızı | Stok rozetleri |

**Tipografi:** Archivo (başlık) · Barlow (arayüz) · JetBrains Mono (parça kodları ve SKU).
Üçü de `latin-ext` alt kümesiyle yüklenir — ş, ğ, ı, İ, ö, ü, ç için zorunlu.

**Logo:** `src/components/brand/Logo.tsx` — altıgen somun gövdesi, yüzünde negatif boşlukta "Y".
Üç tonu vardır (`onLight`, `onBrand`, `onDark`). Favicon: `src/app/icon.svg`.

---

## Uygulama notları / Implementation notes

**Fiyat biçimlendirme.** `Intl.NumberFormat` yerine elle yazılmış formatlayıcı kullanıldı
(`src/lib/format.ts`). Node ile tarayıcının ICU verisi para birimi öncesi boşluk karakterinde
farklılaşabiliyor ve bu, sayfadaki her fiyatta hydration uyuşmazlığı üretiyor.

**Türkçe slug'lar.** `toLowerCase()` "İ" harfini birleşik aksanlı "i̇" hâline getirir ve "ı" harfine
dokunmaz; ikisi de bozuk URL demektir. `slugify()` önce harfleri katlar.

**Parça kodu araması.** Kodlar noktalama atılarak normalize edilir; `SD5S14 6634`,
`sd5s14-6634` ve `SD5S146634` aynı ürünü bulur. Tezgâh üstünde telefonla kod okuyan biri için
kritik.

**Faset sayımları.** Her faset, kendi seçimi hariç diğer tüm filtreler uygulanarak sayılır —
"Sanden" seçmek diğer markaları listeden silmez ama kategori ve araç sayımlarını daraltır.

**Sepet.** Yalnızca `productId` + `quantity` saklar, fiyat anlık görüntüsü **tutmaz**. Fiyatlar
değişir; eski fiyatı hatırlayan sepet destek talebi üretir. `ready` bayrağı, localStorage okunana
kadar sayaç göstermeyi engeller (sunucu sepeti bilemez).

**Sayfalama.** Sunucu tarafında, gerçek URL'lerle. Derin sayfaların taranabilir olması gerekir.

---

## Fiyatlandırma: çift para birimi / Dual-currency pricing

**Fiyatlar USD cinsinden tutulur; TL her render'da hesaplanır.** Bu, müşterinin canlı sitesinden
okunup sekiz fiyat üzerinde doğrulanmış bir kuraldır:

```
liste fiyatı  → satış fiyatı = liste × 0,85      (sabit %15 bayi iskontosu)
satış fiyatı  → TL           = USD × 49,6759     (ERP "Serbest Piyasa Satış")

$300 → $255.00 → 12.667,35 TL   sitede: $255.00 / 12.667,35 TL  ✓
$490 → $416.50 → 20.690,01 TL   sitede: $416.50 / 20.690,01 TL  ✓
$50  →  $42.50 →  2.111,23 TL   sitede:  $42.50 /  2.111,23 TL  ✓
```

Yani **saklanan değer liste fiyatıdır**; satış fiyatı ondan türetilir. Kayıttaki yedi fiyat
çiftinin tamamı tam olarak %15 iskontoludur — uydurma değil, ölçülmüş bir kuraldır.

Tasarım kararları:

- **TL asla saklanmaz.** Kur günlük oynuyor; donmuş bir TL sütunu ertesi gün yanlış olur.
- **Sıralama ve fiyat filtresi USD üzerinden** çalışır, böylece kur değişimi kataloğun sırasını bozmaz.
- **İndirim yüzdesi USD'den** hesaplanır; aksi hâlde yuvarlama yüzünden $ ve TL satırlarında
  farklı yüzde görünebilirdi.
- Kur tek yerde: `src/lib/currency.ts` → `RATES`. Backend geldiğinde buranın gövdesi ERP'den okuyacak.

Ürün sayfasında kur ve kaynağı kullanıcıya yazılır (“TL tutar Serbest Piyasa Satış kuru ile
hesaplanmıştır”) — fiyatın nereden geldiği sorulabilir olmalı.

## Responsive davranış / Responsive behaviour

**Hero.** Tam genişlik (`Container` dışında, viewport'u baştan sona kaplar) ve tam yükseklik:
`min-height: calc(100dvh - var(--header-h))`. `vh` değil `dvh` kullanılır — mobil tarayıcılar
kaydırırken adres çubuğunu küçülttüğünde `vh` boşluk bırakır.

**`--header-h` çalışma zamanında ölçülür.** `src/components/layout/HeaderHeightSync.tsx`, bir
`ResizeObserver` ile sticky header'ın gerçek yüksekliğini CSS değişkenine yazar. Sabit bir değer
doğru olamaz, çünkü header'ın yüksekliği gerçekten değişir:

| Durum | Yükseklik |
|---|---|
| `< lg` (üst bilgi şeridi yok) | 124 px |
| `lg` (menü iki satıra sarıyor) | 168 px |
| `xl+` (menü tek satır) | 160 px |
| Font `swap` sonrası | yeniden ölçülür |

`globals.css` içinde breakpoint başına yedek değerler vardır, böylece sunucudan gelen HTML de
doğru görünür; JS yüklendiğinde değer hassaslaşır.

**`short:` varyantı.** `@custom-variant short (@media (max-height: 640px))` — genişlik
breakpoint'leri "bu ekran yeterince uzun değil" durumunu ifade edemez. 320×568 bir telefon ile
1024×600 bir laptop aynı sorunu yaşar; hero bu varyantla dikey ritmini daraltır.

**Doğrulama.** Üretim derlemesi üzerinde, gerçek tarayıcıda ölçüldü:

```
9 sayfa × 15 viewport = 135 kontrol  →  0 yatay taşma
16 viewport (320×568 … 2560×1440)    →  hero 16/16 tam ekran, 16/16 tam genişlik
Header öğeleri 320–768 px arası      →  çakışma yok
```

## Erişilebilirlik / Accessibility

- Tüm etkileşimli öğeler klavyeyle kullanılabilir; mega menü `Escape` ile kapanır ve odağı geri verir
- Arama kutusu `combobox` + `listbox` deseniyle yazılmıştır (ok tuşları, `aria-activedescendant`)
- `prefers-reduced-motion` desteklenir — hero slider otomatik ilerlemeyi durdurur
- "İçeriğe geç" atlama bağlantısı
- Sarı başlık üzerinde odak halkası koyu renge çevrilir (`.on-brand`)

---

## SEO

- Her listeleme ve ürün sayfasında `generateMetadata` + canonical
- JSON-LD: `Product`, `CollectionPage`, `BreadcrumbList`, `FAQPage`, `Store`, `ContactPage`
- `sitemap.xml` ve `robots.txt` dinamik üretilir; `noindex` sayfalar sitemap'e girmez
- Faset URL'leri (`?siralama=`, `?gorunum=`) robots ile taramadan çıkarılır

---

## Bilinen sınırlar / Known limitations

1. **Ürün görselleri temsilidir.** `public/parts/*.svg` — kategori başına bir çizim. Galeri yapısı
   hazır; gerçek fotoğraflar (parça başına birkaç açı) müşteriden gelecek.
2. **Marka logoları yoktur.** Lisanslı varlıklar; şimdilik marka adı display font ile dizgilenir.
3. **Ödeme yoktur.** Sepet → WhatsApp sipariş özeti.
4. **Üyelik yoktur.** `/hesap` bilgilendirme sayfasıdır.
5. **Katalog 105 üründür.** Fixture; sayfalama, filtre ve sıralamayı gerçekçi biçimde zorlamak için
   yeterli büyüklükte.
6. **B2B özellikleri yok.** Kayıtta görülen cari bakiye, plasiyer ataması, online ödeme ve bayi
   fiyat grupları sunucu tarafı gerektirir — bkz. `docs/VIDEO-INSTRUCTIONS.md` §7.

---

## Durum / Status

```
npm run build      ✅  189 sayfa üretildi
npm run lint       ✅  0 hata
npm run typecheck  ✅  0 hata
```
