# OFG — Kayıttan Çıkarılan Gereksinimler / Requirements Extracted from the Recording

**Kaynak / Source:** `ofg.mp4` — 24 dk 19 sn, 1920×1080 Google Meet ekran paylaşımı
**Katılımcılar / Participants:** "OFG" (ekranı paylaşan / screen sharer), "Yusuf"
**Kayıt tarihi / Recorded:** 22.10.2026, 18:14–18:38 (ekrandaki saatten / from the on-screen clock)
**Referans siteler / Sites shown:** `kafkasotoofgca.com` · `ofgotoklima.com.tr` · DIA ERP · OFG yönetim paneli

---

## ⚠️ Yöntem ve sınırlar / Method and limits

**TR:** Ses içeriğini dinleyip deşifre edemiyorum. Bu belgedeki gereksinimler, kaydın **görüntüsünden**
çıkarılmıştır: ffmpeg ile 20 saniyede bir kare alınarak 9 adet kontak sayfası üretildi, ardından kritik
anlar tam çözünürlükte kırpılıp okundu. Konuşulanlar bu belgeye **dahil değildir**.

**EN:** I cannot hear or transcribe the audio. Everything below was read from the **picture**: frames were
sampled every 20s into 9 contact sheets with ffmpeg, then key moments were cropped at full resolution and
read. **Nothing spoken is captured here.**

Bunun pratik sonucu / What this means in practice:

- ✅ **Güvenilir:** ekranda görünen yapı, alan adları, fiyat biçimi, kategori/marka listeleri, sayfa akışı.
  Bunlar doğrudan okunmuştur ve aşağıda kare zaman damgasıyla verilmiştir.
- ⚠️ **Eksik:** önceliklendirme, "şunu istemiyorum", teslim tarihi, bütçe, hangi özelliğin zorunlu hangisinin
  isteğe bağlı olduğu. Bunlar konuşulmuş olabilir; bilmiyorum.

Sesin deşifresi hâlâ faydalı olur — ekranda hiç görünmeyen kararlar orada olabilir.

---

## 1. Kritik bulgu: proje aslında ne / The critical finding

Kayıt yalnızca Kafkas sitesini göstermiyor. **Müşterinin kendi sitesi var: `ofgotoklima.com.tr`** ve bu site
bir **B2B bayi portalı**. Kafkas rakip/örnek olarak inceleniyor.

İlk teslimde bu bilinmiyordu; site B2C perakende varsayımıyla kuruldu. Aşağıdaki farklar bu yüzden kritik.

| Kanıt / Evidence | Kare / Frame |
|---|---|
| Üst barda **"Merhaba ÇOŞKUNLAR OT… Bakiye: (B) -34.500,00 TL"** — cari hesap bakiyesi | 08:20 |
| **"Satış temsilciniz atanmamış"** — müşteriye atanmış plasiyer kavramı | 07:00+ |
| Üst menü: Raporlar · Hesap · Dövizler · Servis Hizmetleri · **Plasiyer** · **Online Ödeme** | 08:20 |
| Yönetim panelinde **Döviz Kurları** tablosu | 20:20 |
| Fiyatların **hem $ hem TL** gösterilmesi | 05:45+ |

> **Sonuç:** Bu bir toptan/bayi sitesidir. WhatsApp ile sipariş akışı (ilk teslimde yapılan) bu modele
> uymaz; sepet → sipariş → cari hesap akışı gerekir. Bkz. §7.

---

## 2. Fiyatlandırma — en önemli tek gereksinim / Pricing, the single biggest requirement

Ürün fiyatları **USD cinsinden tutuluyor**, TL karşılığı güncel kurla **hesaplanarak** gösteriliyor.
Her iki para biriminde de indirim öncesi fiyat üstü çizili olarak yer alıyor.

Ürün sayfasından birebir / verbatim from the product page (08:20):

```
PEUGEOT P208 12> P2008 13> C3 12> 1.0 VTI 1.2 VTI PURETECH DS3 14> 1.2 6pk 12V Klima Kompresörü

$340.00   $400.00          ← ikincisi üstü çizili, kırmızı
16.889,81 TL   19.870,36 TL ← ikincisi üstü çizili, kırmızı
```

Yönetim panelindeki kur tablosu (20:20):

| Döviz Adı | Serbest Piyasa Satış |
|---|---|
| EUR | 51,7616 |
| TRY | 1,0 |
| **USD** | **49,6759** |

**Doğrulama / Verification.** Formül `TL = USD × 49,6759` kayıttaki sekiz fiyatın tamamını tutturuyor:

| USD | Hesaplanan | Ekranda | |
|---|---|---|---|
| $340.00 | 16.889,81 | 16.889,81 | ✓ |
| $400.00 | 19.870,36 | 19.870,36 | ✓ |
| $42.50 | 2.111,23 | 2.111,23 | ✓ |
| $50.00 | 2.483,80 | 2.483,79 | ✓ (yuvarlama) |
| $361.25 | 17.945,42 | 17.945,42 | ✓ |
| $255.00 | 12.667,35 | 12.667,35 | ✓ |
| $425.00 | 21.112,26 | 21.112,26 | ✓ |

Yani kur, ERP'deki **"Serbest Piyasa Satış"** değeridir ve TL fiyat her istekte yeniden hesaplanır —
veritabanında donmuş TL fiyat tutulmaz.

**Durum:** ✅ Uygulandı — `src/lib/currency.ts`, `src/lib/format.ts`.

---

## 3. Detaylı Arama — eksik olan büyük özellik / The missing big feature

`kafkasotoofgca.com/arama/COROLLA` adresinde ayrı bir **Detaylı Arama** sayfası var (10:20).
URL deseni **yol tabanlı**: `/arama/<terim>`, querystring değil.

Alanlar / Fields:

| Alan | Tip | Gözlem |
|---|---|---|
| Anahtar Kelime | metin | örnekte `COROLLA` |
| Kategoriler | açılır liste | "Tümü" + tüm kategoriler |
| Markalar | açılır liste | "Tümü" + 11 marka (aşağıda) |
| Stok Kodu | metin | parça kodu ile birebir arama |
| Fiyat Aralığı | min–max | |

Sonuç alanında ayrıca "Stoktakiler" onay kutusu, "Toplam N ürün" ve sıralama yer alıyor.

**Durum:** ✅ Uygulandı — `/arama/[terim]` + `/arama`, `src/app/arama/`.

---

## 4. Kategoriler — 18 adet / 18 categories

Detaylı Arama sayfasının sol kolonundan birebir okundu (10:20). İlk teslimdeki 8 kategoriden çok daha geniş:

```
Klima Kompresörü                 Klima Sibobu
Araç Markasına Göre Kompresör    Servis Cihazları
Klima Radyatörü ( Kondanser )    Servis Ekipmanları
Kompresör Yedek Parça            Klima Kimyasal Sıvıları
Klima Fanı                       Oto Klima Evaporatör
Klima Valfleri                   Dizel Isıtıcı
Oto Klima Hortumu                Klima Kurutucu Filtre ( Drayer )
Oto Klima Gazı                   Klima Rekor
                                 Klima Oring - Pul
                                 Klima Müşürü
```

> Yazım notu: site **"Kondanser"** yazıyor (yaygın "Kondenser" değil). Birebir korundu.

**Üst menü (header) / Main nav** — 5 bağlantı:
Klima Kompresörü · Klima Radyatörü (Kondanser) · Klima Kasnak Seti · Oto Klima Hortumu · Klima Kimyasal Sıvıları

**Durum:** ✅ Uygulandı — `src/lib/data/categories.ts`.

---

## 5. Markalar — 11 adet / 11 brands

"Markalar" açılır listesinden birebir (10:20):

```
Sanden · Wutse · Denso · Valeo · Mahle · Delphi · Hanon · Doowon · AC EDGE · Kohlass · EG Makina
```

İlk teslimde uydurduğum Behr/Zexel/Calsonic/Nissens/Halla/Safkar markaları **listede yok** — kaldırıldı.
Ana sayfadaki logo şeridinde de aynı markalar görünüyor (12:20).

**Durum:** ✅ Uygulandı — `src/lib/data/brands.ts`.

---

## 6. Sayfa düzenleri / Page layouts

### 6.1 Ana sayfa (Kafkas, 12:20–13:20)

| Bölüm | Gözlem | Durum |
|---|---|---|
| Hero slider | Tam genişlik, "Sanden Klima Kompresörleri" / "Wutse Klima Kasnak Setleri" + "Şimdi İncele!" | ✅ |
| Marka logo şeridi | Sanden, Hanon, Doowon, AC EDGE, Kohlass, EG Makina — yatay sıra | ✅ |
| Kategori kartları | Görselli, alt kategori bağlantılı | ✅ |
| **İkili marka bannerı** | VALEO (kırmızı) + DENSO (siyah), "Ürünleri İncele!" → `/marka/valeo` | ✅ **yeni** |
| **ÖNE ÇIKAN ÜRÜNLER** | **Hap şeklinde sekmeler**: Klima Kompresörü / Klima Radyatörü / Klima Kasnak Seti | ✅ **düzeltildi** |
| Araç markası bannerları | FORD, VOLKSWAGEN, OPEL, HYUNDAI, RENAULT ızgarası | ✅ |

> İlk teslimde "öne çıkan ürünler" üç ayrı bölüm olarak yapılmıştı; kayıtta **tek bölüm + sekme**.

### 6.2 Ürün sayfası (OFG, 08:20)

| Öğe | Gözlem | Durum |
|---|---|---|
| Marka etiketi | Başlığın üstünde ayrı satır (PEUGEOT) | ✅ |
| Çift fiyat | $ ve TL, ikisi de üstü çizili liste fiyatlı | ✅ **yeni** |
| Adet + Sepete Ekle | − / + sayaç, yanında buton | ✅ |
| **Stok Kodu** | `OFG-21025-ORJ` | ✅ |
| **Barkod** | ayrı alan (örnekte boş) | ✅ **yeni** |
| **Stok** | **sayısal** (`5`), yeşil | ✅ **yeni** (önce yalnız rozet vardı) |
| **Görsel galerisi** | 5 küçük resim + büyük görsel | ✅ **yeni** |
| Açıklama sekmesi | Teknik özellikler metin olarak | ✅ |

Teknik açıklama alanı birebir (BMW ürünü, 06:20):
```
Number of grooves: 9
Belt Pulley diameter: 110
Compressor ID: 7SEU17C
Manufacturer: SANDEN, BMW, DENSO
For OE number: 64529175481
```

### 6.3 Listeleme (OFG, 07:00)

Ürün kartında **doğrudan − / + adet sayacı ve sepet ikonu** var — karttan çıkmadan miktar girilebiliyor.
Toptancı için doğal; B2C kartlarında alışılmış değil.

**Durum:** ✅ Uygulandı.

### 6.4 Ana sayfa bölümleri (OFG, 07:00)

`Yeni Ürünler` ve `Çok Satanlar` yatay ürün rayları. **Durum:** ✅ Uygulandı.

---

## 7. Uygulanmayanlar ve nedeni / Not implemented, and why

Bunlar kayıtta **açıkça görünüyor** ama sunucu tarafı olmadan dürüstçe yapılamaz. Arayüz hazır, veri yok:

| Özellik | Neden ertelendi |
|---|---|
| Cari hesap bakiyesi ("Bakiye: (B) -34.500,00 TL") | Muhasebe entegrasyonu gerekir (DIA ERP) |
| Satış temsilcisi / Plasiyer ataması | Kullanıcı–personel eşlemesi, backend |
| Online Ödeme | Sanal POS sözleşmesi ve PCI kapsamı |
| Raporlar / Hesap ekstresi | ERP verisi |
| Bayiye özel fiyat listesi | Oturum + fiyat grubu mantığı |
| Gerçek ürün görselleri ve marka logoları | Müşteriden gelecek lisanslı varlıklar |

> **Önemli:** Bayi girişi olmadan fiyatların herkese açık gösterilip gösterilmeyeceği kayıttan anlaşılmıyor.
> OFG sitesinde fiyatlar **giriş yapılmış** bir oturumda görünüyor. Bu bir iş kuralı — teyit gerekir (§9).

---

## 8. DIA ERP — veri kaynağı / The data source

Kaydın 14:00–17:00 aralığı **DIA ERP** (`dia.com.tr`) "Stok Kartı" ekranlarını gösteriyor: ürün ana verisi
orada tutuluyor, yüzlerce satırlık stok listeleri renk kodlu olarak yönetiliyor.

Backend planlanırken: ürün kataloğu muhtemelen **DIA'dan senkronize edilecek**, elle girilmeyecek.
`src/lib/repository.ts` bu yüzden tek giriş noktası olarak bırakıldı — senkron oradan beslenir.

Ayrıca 00:00–00:30 arasında bir **Excel ürün listesi** görünüyor (parça kodu, fiyat, grup sütunları) —
ilk yüklemenin bu dosyadan yapılması muhtemel.

---

## 9. Müşteriye sorulacaklar / Open questions

Kayıttan **cevaplanamayan**, işi etkileyen sorular:

1. **Fiyatlar herkese açık mı?** OFG'de fiyatlar oturum açmış bayiye gösteriliyor. Ziyaretçi fiyat görecek mi?
2. **Kur ne sıklıkla güncellenecek?** ERP'den mi çekilecek, TCMB'den mi? Gün içinde kaç kez?
3. **Kur hangi değer?** Panelde "Serbest Piyasa Satış" kullanılmış; Efektif/Alış değil. Teyit?
4. **KDV** USD fiyata mı dahil, TL'ye çevrildikten sonra mı ekleniyor?
5. **Bayi fiyat grupları** var mı (bayi A / bayi B farklı iskonto)?
6. **Sipariş akışı**: sepet → onay → cari hesaba borç mu, yoksa online ödeme zorunlu mu?
7. **OFG mı OFG mi?** Proje adı OFG verildi ama müşterinin markası OFG. Site hangi isimle yayınlanacak?
8. Minimum sipariş tutarı / adedi var mı?

---

## 10. Kare referansları / Frame references

Belgedeki her iddia şu karelerden okunmuştur:

| Zaman | İçerik |
|---|---|
| 00:00–00:30 | Excel ürün listesi |
| 00:30–03:00 | Kafkas ana sayfa, mega menü, Sanden marka sayfası, sıralama |
| 03:00–05:30 | Kafkas kategori sayfası, marka filtresi, Oto Klima Hortumu |
| 05:30–08:30 | **OFG sitesi**: ana sayfa, Yeni Ürünler, ürün detay, çift fiyat |
| 09:00–10:00 | Kafkas footer, hizmet rozetleri |
| 10:00–11:00 | **Detaylı Arama** — alanlar ve açılır listeler |
| 12:00–13:30 | Kafkas ana sayfa: logo şeridi, ikili banner, ÖNE ÇIKAN sekmeleri |
| 14:00–17:00 | **DIA ERP** stok kartı ve listeleri |
| 19:30–21:00 | **OFG yönetim paneli**: siparişler, döviz kurları, istatistikler |
| 21:30–23:00 | Stok kodu ile arama, Google Görseller'de parça arama |

Kareler `ffmpeg` ile yeniden üretilebilir:

```bash
ffmpeg -i ofg.mp4 -vf "fps=1/20,scale=640:-1,tile=3x3" sheet_%02d.jpg   # genel bakış
ffmpeg -ss 620 -i ofg.mp4 -frames:v 1 -vf "crop=1330:760:60:160,scale=iw*1.6:ih*1.6" detayli-arama.jpg
```
