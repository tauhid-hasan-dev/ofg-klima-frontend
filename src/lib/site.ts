/**
 * Single source of truth for everything the client will want to change without
 * touching components: company details, contact channels, nav, legal pages.
 */
export const site = {
  name: "OFG",
  legalName: "OFG Oto Klima Yedek Parça",
  tagline: "Oto Klima Yedek Parçada Doğru Adres",
  description:
    "Oto klima kompresörü, kondenser, kasnak seti, valf, fan ve klima gazı ürünlerinde geniş stok, hızlı kargo ve uygun fiyat. Orijinal ve muadil yedek parçalar OFG güvencesiyle.",
  url: "https://www.ofgotoklima.com.tr",
  locale: "tr-TR",

  phone: "+905309611905",
  whatsapp: "+905309611905",
  email: "info@ofgotoklima.com.tr",
  address: {
    street: "Oto Sanayi Sitesi, 1. Blok No: 24",
    district: "Bayrampaşa",
    city: "İstanbul",
    country: "Türkiye",
  },
  workingHours: "Pazartesi – Cumartesi · 08:30 – 19:00",

  social: {
    instagram: "https://instagram.com/ofgotoklima",
    facebook: "https://facebook.com/ofgotoklima",
    youtube: "https://youtube.com/@ofgotoklima",
  },

  /** Trust strip shown under the header on the home page. */
  highlights: [
    { title: "Aynı Gün Kargo", text: "16:00'a kadar verilen siparişler aynı gün kargoda." },
    { title: "Orijinal & Muadil", text: "Faturalı, garantili ve test edilmiş ürünler." },
    { title: "Teknik Destek", text: "Doğru parçayı birlikte seçelim, WhatsApp'tan yazın." },
    { title: "Güvenli Ödeme", text: "Kredi kartına taksit ve havale seçenekleri." },
  ],
} as const;

export const footerLinks = {
  kurumsal: {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "İletişim", href: "/iletisim" },
      { label: "Bayilik Başvurusu", href: "/iletisim" },
      { label: "Blog", href: "/blog" },
    ],
  },
  alisveris: {
    title: "Alışveriş",
    links: [
      { label: "Tüm Markalar", href: "/marka" },
      { label: "Klima Kompresörü", href: "/kategori/klima-kompresoru" },
      { label: "Klima Radyatörü", href: "/kategori/klima-radyatoru" },
      { label: "Klima Kasnak Seti", href: "/kategori/klima-kasnak-seti" },
      { label: "Oto Klima Gazı", href: "/kategori/oto-klima-gazi" },
    ],
  },
  yardim: {
    title: "Yardım",
    links: [
      { label: "Sipariş Takibi", href: "/siparis-takibi" },
      { label: "Kargo ve Teslimat", href: "/kargo-ve-teslimat" },
      { label: "İade ve Değişim", href: "/iade-ve-degisim" },
      { label: "Sıkça Sorulan Sorular", href: "/sss" },
    ],
  },
  sozlesmeler: {
    title: "Sözleşmeler",
    links: [
      { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
      { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
      { label: "KVKK Aydınlatma Metni", href: "/kvkk" },
      { label: "Çerez Politikası", href: "/cerez-politikasi" },
    ],
  },
} as const;
