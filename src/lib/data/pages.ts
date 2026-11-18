import { site } from "@/lib/site";

/**
 * Editorial content for the corporate / policy pages.
 *
 * Kept as data rather than ten bespoke components so the client (or a CMS,
 * later) can edit copy in one place. Body entries are rendered as paragraphs,
 * headings or lists by `StaticPage`.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "faq"; items: { q: string; a: string }[] };

export interface StaticPageContent {
  slug: string;
  title: string;
  lead?: string;
  description: string;
  /** Policy pages should not compete with catalogue pages in search results. */
  noindex?: boolean;
  blocks: Block[];
}

const LEGAL_NOTE =
  "Bu metin örnek içeriktir. Yayına almadan önce hukuk danışmanınız tarafından firmanızın gerçek ticari bilgileri ve süreçleriyle güncellenmelidir.";

export const staticPages: Record<string, StaticPageContent> = {
  hakkimizda: {
    slug: "hakkimizda",
    title: "Hakkımızda",
    lead: `${site.legalName}, oto klima sistemleri yedek parçalarında toptan ve perakende satış yapan bir tedarikçidir.`,
    description: `${site.name} hakkında: oto klima yedek parça tedarikinde deneyim, stok politikası ve hizmet anlayışımız.`,
    blocks: [
      {
        type: "p",
        text: "Oto klima sistemleri, aracın en sık arızalanan ve en çok yanlış parça takılan gruplarından biridir. Bir kompresörün kasnak kanal sayısı, voltajı veya kontrol valfi tipi tutmadığında, parça fiziksel olarak takılsa bile sistem kısa sürede tekrar arızalanır. Bu nedenle işimizin merkezine stok genişliğinden önce doğru eşleştirmeyi koyduk.",
      },
      {
        type: "p",
        text: "Kataloğumuzdaki her ürün; OEM kodu, stok kodu, voltaj, kasnak çapı, kanal sayısı, soğutucu akışkan tipi ve uyumlu araç listesi ile birlikte yayınlanır. Böylece müşterimiz siparişi vermeden önce elindeki parçayla karşılaştırma yapabilir.",
      },
      { type: "h2", text: "Çalıştığımız Markalar" },
      {
        type: "p",
        text: "Sanden, Denso, Valeo, Delphi, Hanon ve Doowon gibi orijinal ekipman üreticilerinin ürünlerinin yanında; Wutse, Mahle, AC EDGE, Kohlass ve EG Makina muadillerini de stoklarımızda bulunduruyoruz. Böylece hem OE kalitesi arayan servislere hem de bütçe odaklı çözüm isteyen müşterilere seçenek sunabiliyoruz.",
      },
      { type: "h2", text: "Hizmet Verdiğimiz Alanlar" },
      {
        type: "ul",
        items: [
          "Binek ve hafif ticari araç klima kompresörleri",
          "Otobüs, kamyon ve ağır vasıta klima grupları",
          "İş makinesi ve traktör klima sistemleri",
          "Kondenser, kasnak seti, valf, fan ve sarf malzemeleri",
          "Oto klima servisleri ve yedek parçacılar için toptan tedarik",
        ],
      },
      { type: "h2", text: "Bayilik ve Toptan Satış" },
      {
        type: "p",
        text: `Oto klima servisi, yedek parça bayisi veya filo bakım ekibi iseniz özel fiyat listemizden faydalanabilirsiniz. Başvuru için ${site.email} adresine ya da WhatsApp hattımıza yazmanız yeterli.`,
      },
    ],
  },

  "siparis-takibi": {
    slug: "siparis-takibi",
    title: "Sipariş Takibi",
    lead: "Siparişinizin durumunu öğrenmenin en hızlı yolu WhatsApp hattımızdır.",
    description: "OFG sipariş takibi: kargo durumu ve teslimat bilgisi nasıl öğrenilir.",
    noindex: true,
    blocks: [
      {
        type: "p",
        text: "Online sipariş takip ekranı, üyelik altyapısı tamamlandığında bu sayfada yayına alınacaktır. O zamana kadar sipariş numaranızı ya da siparişi verdiğiniz telefon numarasını WhatsApp hattımıza iletmeniz yeterli; kargo takip numaranızı anında paylaşıyoruz.",
      },
      { type: "h2", text: "Kargo Süreci" },
      {
        type: "ul",
        items: [
          "16:00'a kadar onaylanan siparişler aynı gün kargoya teslim edilir.",
          "İstanbul içi teslimat genellikle 1 iş günü sürer.",
          "Diğer iller için ortalama teslim süresi 1–3 iş günüdür.",
          "Kargo takip numarası, çıkış yapıldığında SMS veya WhatsApp ile iletilir.",
        ],
      },
    ],
  },

  "kargo-ve-teslimat": {
    slug: "kargo-ve-teslimat",
    title: "Kargo ve Teslimat",
    description: "Kargo ücretleri, teslimat süreleri ve hasarlı ürün teslim alma kuralları.",
    blocks: [
      { type: "h2", text: "Kargo Ücreti" },
      {
        type: "p",
        text: "7.500 TL ve üzeri siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde sabit 249 TL kargo bedeli uygulanır. Hacimli ürünlerde (otobüs kondenseri, komple klima grubu vb.) desi farkı oluşabilir; bu durumda sipariş onayından önce tarafınıza bilgi verilir.",
      },
      { type: "h2", text: "Teslimat Süresi" },
      {
        type: "ul",
        items: [
          "Stoktaki ürünler: 16:00'a kadar verilen siparişler aynı gün kargoda.",
          "Siparişe bağlı ürünler: 2–5 iş günü içinde tedarik edilir.",
          "Hafta sonu ve resmî tatillerde kargo çıkışı yapılmaz.",
        ],
      },
      { type: "h2", text: "Teslim Alırken Dikkat Edilmesi Gerekenler" },
      {
        type: "p",
        text: "Paketi kargo görevlisinin yanında kontrol edin. Kutuda ezilme, yırtılma veya ıslanma varsa tutanak tutturmadan teslim almayın. Tutanaksız bildirilen hasarlarda kargo firması sorumluluk kabul etmediği için işlem yapılamamaktadır.",
      },
    ],
  },

  "iade-ve-degisim": {
    slug: "iade-ve-degisim",
    title: "İade ve Değişim",
    description: "14 günlük cayma hakkı, değişim koşulları ve garanti süreci.",
    blocks: [
      { type: "h2", text: "Cayma Hakkı" },
      {
        type: "p",
        text: "Mesafeli Sözleşmeler Yönetmeliği uyarınca, ürünü teslim aldığınız tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkınızı kullanabilirsiniz. Ürünün kutusu, aksesuarları ve faturası ile birlikte, kullanılmamış ve tekrar satılabilir durumda olması gerekir.",
      },
      { type: "h2", text: "İade Kabul Edilmeyen Durumlar" },
      {
        type: "ul",
        items: [
          "Araca takılmış, yağı boşaltılmış veya sisteme bağlanmış kompresörler",
          "Ambalajı açılmış soğutucu akışkan (gaz) tüpleri ve kimyasal sıvılar",
          "Kesilmiş, ölçüye göre hazırlanmış hortum ve rekorlar",
          "Müşteri talebiyle özel olarak tedarik edilen, stokta tutulmayan ürünler",
        ],
      },
      { type: "h2", text: "Garanti" },
      {
        type: "p",
        text: "Ürünlerimiz markasına göre 12 ila 24 ay üretim hatalarına karşı garantilidir. Garanti, yanlış montaj, sisteme kaçak/nem girmesi, yağ seviyesinin hatalı ayarlanması ve dış etkenlerden kaynaklanan arızaları kapsamaz. Garanti talebi için ürünün yetkili bir oto klima servisinde sökülmüş olması ve arıza raporu düzenlenmesi gerekir.",
      },
      { type: "p", text: LEGAL_NOTE },
    ],
  },

  sss: {
    slug: "sss",
    title: "Sıkça Sorulan Sorular",
    description: "Oto klima yedek parça siparişi, uyumluluk, kargo ve garanti hakkında sık sorulan sorular.",
    blocks: [
      {
        type: "faq",
        items: [
          {
            q: "Aracıma hangi kompresörün uyacağını nasıl anlarım?",
            a: "En güvenilir yöntem, araçta takılı olan kompresörün üzerindeki üretici kodunu okumaktır. Bu kodu WhatsApp hattımıza gönderdiğinizde, stoğumuzdaki birebir muadilini dakikalar içinde teyit ediyoruz. Kod okunamıyorsa aracınızın şasi (VIN) numarası ile de eşleştirme yapabiliyoruz.",
          },
          {
            q: "Orijinal ile muadil ürün arasındaki fark nedir?",
            a: "Orijinal (OE) ürünler, aracın fabrika çıkışında kullanılan üreticiye aittir. Muadil ürünler ise aynı teknik ölçülerde üretilen alternatiflerdir. Kaliteli bir muadil, doğru seçildiğinde OE performansına yakın sonuç verir ve genellikle belirgin şekilde daha ekonomiktir.",
          },
          {
            q: "Kompresör değişiminde başka hangi parçalar değişmeli?",
            a: "Kompresör arızalandığında sisteme metal talaşı yayılmış olabilir. Bu nedenle kurutucu (drier) ve ekspansiyon valfinin birlikte değiştirilmesi, sistemin de basınçlı olarak yıkanması önerilir. Aksi halde yeni kompresör kısa sürede tekrar arıza yapabilir.",
          },
          {
            q: "R134a yerine R1234yf kullanabilir miyim?",
            a: "Hayır. İki akışkanın çalışma basınçları, yağ tipleri ve bağlantı rekorları farklıdır. Aracınızın motor bölmesindeki etikette hangi gazın kullanılacağı yazar; bunun dışına çıkılması sisteme kalıcı zarar verir.",
          },
          {
            q: "Fatura kesiyor musunuz?",
            a: "Evet. Tüm satışlarımız faturalıdır. Kurumsal müşterilerimiz için e-fatura düzenlenmektedir; vergi bilgilerinizi sipariş sırasında iletmeniz yeterlidir.",
          },
          {
            q: "Toptan alımda özel fiyat var mı?",
            a: "Oto klima servisleri, yedek parça bayileri ve filo bakım ekipleri için özel fiyat listemiz bulunmaktadır. Bayilik başvurusu için iletişim sayfamızdaki formu kullanabilirsiniz.",
          },
        ],
      },
    ],
  },

  blog: {
    slug: "blog",
    title: "Blog",
    lead: "Oto klima sistemleri üzerine teknik yazılar ve bakım rehberleri.",
    description: "Oto klima bakımı, arıza teşhisi ve yedek parça seçimi üzerine teknik içerikler.",
    blocks: [
      {
        type: "p",
        text: "Blog bölümü yayına hazırlanıyor. Burada kompresör arıza teşhisi, sistem yıkama prosedürü, doğru yağ seçimi ve sezonluk klima bakımı gibi konularda servis tecrübemizi paylaşacağız.",
      },
      {
        type: "p",
        text: "İçerikler yayına girene kadar aklınıza takılan teknik soruları WhatsApp hattımızdan sorabilirsiniz.",
      },
    ],
  },

  "gizlilik-politikasi": {
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası",
    description: "Kişisel verilerinizin toplanması, işlenmesi ve korunmasına ilişkin esaslar.",
    noindex: true,
    blocks: [
      {
        type: "p",
        text: `${site.legalName} olarak, web sitemizi ziyaret eden ve sipariş veren kullanıcılarımızın kişisel verilerinin gizliliğine önem veriyoruz.`,
      },
      { type: "h2", text: "Toplanan Veriler" },
      {
        type: "ul",
        items: [
          "Ad, soyad ve iletişim bilgileri (sipariş ve teslimat için)",
          "Fatura ve adres bilgileri",
          "Site kullanım verileri (çerezler aracılığıyla, anonim olarak)",
        ],
      },
      { type: "h2", text: "Verilerin Kullanımı" },
      {
        type: "p",
        text: "Toplanan veriler yalnızca siparişin işlenmesi, teslimatın gerçekleştirilmesi, faturalandırma ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır. Verileriniz, hizmet aldığımız kargo ve ödeme kuruluşları dışında üçüncü taraflarla paylaşılmaz.",
      },
      { type: "p", text: LEGAL_NOTE },
    ],
  },

  "mesafeli-satis-sozlesmesi": {
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli Satış Sözleşmesi",
    description: "Satıcı ve alıcı yükümlülükleri, teslimat ve cayma hakkı koşulları.",
    noindex: true,
    blocks: [
      { type: "h2", text: "1. Taraflar" },
      {
        type: "p",
        text: `Satıcı: ${site.legalName}, ${site.address.street}, ${site.address.district} / ${site.address.city}. Alıcı: sipariş formunda bilgileri yer alan kişi veya kurum.`,
      },
      { type: "h2", text: "2. Sözleşmenin Konusu" },
      {
        type: "p",
        text: "İşbu sözleşmenin konusu, alıcının elektronik ortamda siparişini verdiği ürünlerin satışı ve teslimi ile ilgili olarak tarafların hak ve yükümlülüklerinin belirlenmesidir.",
      },
      { type: "h2", text: "3. Teslimat ve Cayma Hakkı" },
      {
        type: "p",
        text: "Teslimat koşulları Kargo ve Teslimat sayfasında, cayma hakkı ve istisnaları İade ve Değişim sayfasında ayrıntılı olarak düzenlenmiştir ve bu sözleşmenin ayrılmaz parçasıdır.",
      },
      { type: "p", text: LEGAL_NOTE },
    ],
  },

  kvkk: {
    slug: "kvkk",
    title: "KVKK Aydınlatma Metni",
    description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
    noindex: true,
    blocks: [
      {
        type: "p",
        text: `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla ${site.legalName} tarafından kişisel verileriniz aşağıda açıklanan kapsamda işlenmektedir.`,
      },
      { type: "h2", text: "Haklarınız" },
      {
        type: "ul",
        items: [
          "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
          "İşlenmişse buna ilişkin bilgi talep etme",
          "Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme",
          "Kanunda öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme",
        ],
      },
      {
        type: "p",
        text: `Taleplerinizi ${site.email} adresine iletebilirsiniz. Başvurular en geç 30 gün içinde sonuçlandırılır.`,
      },
      { type: "p", text: LEGAL_NOTE },
    ],
  },

  "cerez-politikasi": {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    description: "Sitemizde kullanılan çerezler ve tarayıcı ayarlarından yönetimi.",
    noindex: true,
    blocks: [
      {
        type: "p",
        text: "Sitemiz, alışveriş deneyiminizi sürdürebilmek için tarayıcınızda sınırlı miktarda veri saklar. Sepet içeriğiniz, sunucuya gönderilmeden yalnızca kendi tarayıcınızın yerel depolama alanında tutulur.",
      },
      { type: "h2", text: "Kullanılan Çerez Türleri" },
      {
        type: "ul",
        items: [
          "Zorunlu çerezler: sepet ve oturum bilgisinin korunması için gereklidir.",
          "Performans çerezleri: sayfa yüklenme sürelerinin ölçülmesinde kullanılır.",
        ],
      },
      {
        type: "p",
        text: "Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz; ancak bu durumda sepet gibi bazı işlevler çalışmayabilir.",
      },
    ],
  },

  hesap: {
    slug: "hesap",
    title: "Üye Girişi",
    lead: "Üyelik sistemi kurulum aşamasındadır.",
    description: "OFG üye girişi ve hesap yönetimi.",
    noindex: true,
    blocks: [
      {
        type: "p",
        text: "Üyelik ve sipariş geçmişi ekranları, backend altyapısı tamamlandığında bu sayfada yayına alınacaktır. Şimdilik sipariş vermek için sepetinizi oluşturup WhatsApp üzerinden tamamlamanız yeterli — üyelik gerekmez.",
      },
      { type: "h2", text: "Kurumsal Müşteriler" },
      {
        type: "p",
        text: "Bayi ve servis müşterilerimiz için cari hesap ve özel fiyat listesi tanımlanmaktadır. Talebinizi iletişim sayfamızdan iletebilirsiniz.",
      },
    ],
  },
};
