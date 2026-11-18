import type { Category } from "@/lib/types";

/**
 * Category tree.
 *
 * The 18 top-level groups were read verbatim off the client's "Detaylı Arama"
 * sidebar in the recording (10:20). Spelling is preserved exactly as the site
 * writes it — notably "Kondanser" (not the more common "Kondenser") and
 * "Drayer" — because these strings are what their customers search for.
 */
export const categories: Category[] = [
  {
    slug: "klima-kompresoru",
    name: "Klima Kompresörü",
    image: "/parts/kompresor.svg",
    inMainNav: true,
    description:
      "Binek, ticari ve iş makinesi araçlar için orijinal ve muadil oto klima kompresörleri. Tüm ürünler test edilerek sevk edilir.",
  },
  { slug: "oto-klima-kompresoru", name: "Oto Klima Kompresörü", parent: "klima-kompresoru", image: "/parts/kompresor.svg" },
  { slug: "universal-klima-kompresoru", name: "Üniversal Klima Kompresörü", parent: "klima-kompresoru", image: "/parts/kompresor.svg" },
  { slug: "is-makinesi-klima-kompresoru", name: "İş Makinesi Klima Kompresörü", parent: "klima-kompresoru", image: "/parts/kompresor.svg" },

  {
    slug: "arac-markasina-gore-kompresor",
    name: "Araç Markasına Göre Kompresör",
    image: "/parts/kompresor.svg",
    description: "Aracınızın markasını seçerek uyumlu klima kompresörlerine ulaşın.",
  },

  {
    slug: "klima-radyatoru",
    name: "Klima Radyatörü ( Kondanser )",
    image: "/parts/kondenser.svg",
    inMainNav: true,
    description:
      "Kondanser ve klima radyatörü modelleri. Alüminyum kanatlı, sızdırmazlık testinden geçirilmiş ürünler.",
  },
  { slug: "universal-klima-radyatoru", name: "Üniversal Klima Radyatörü", parent: "klima-radyatoru", image: "/parts/kondenser.svg" },
  { slug: "arac-klima-radyatoru", name: "Araca Göre Klima Radyatörü", parent: "klima-radyatoru", image: "/parts/kondenser.svg" },

  {
    slug: "kompresor-yedek-parca",
    name: "Kompresör Yedek Parça",
    image: "/parts/kasnak.svg",
    description: "Kompresör kasnağı, manyetik bobin, baskı plakası ve diğer kompresör yedek parçaları.",
  },
  { slug: "klima-kasnak-seti", name: "Klima Kasnak Seti", parent: "kompresor-yedek-parca", image: "/parts/kasnak.svg" },
  { slug: "kompresor-kasnagi", name: "Kompresör Kasnağı", parent: "kompresor-yedek-parca", image: "/parts/kasnak.svg" },
  { slug: "manyetik-bobin", name: "Manyetik Bobin", parent: "kompresor-yedek-parca", image: "/parts/kasnak.svg" },
  { slug: "baski-plakasi", name: "Baskı Plakası", parent: "kompresor-yedek-parca", image: "/parts/kasnak.svg" },

  {
    slug: "klima-fani",
    name: "Klima Fanı",
    image: "/parts/fan.svg",
    description: "Aksiyel fan, blower fan ve fan motoru çeşitleri.",
  },
  { slug: "aksiyel-fan", name: "Aksiyel Fan", parent: "klima-fani", image: "/parts/fan.svg" },
  { slug: "blower-fan", name: "Blower (Kalorifer) Fanı", parent: "klima-fani", image: "/parts/fan.svg" },

  {
    slug: "klima-valfleri",
    name: "Klima Valfleri",
    image: "/parts/valf.svg",
    description: "Kontrol valfi, ekspansiyon valfi ve termostat grubu ürünleri.",
  },
  { slug: "kontrol-valfi", name: "Kontrol Valfi", parent: "klima-valfleri", image: "/parts/valf.svg" },
  { slug: "ekspansiyon-valfi", name: "Ekspansiyon Valfi", parent: "klima-valfleri", image: "/parts/valf.svg" },
  { slug: "termostat", name: "Termostat", parent: "klima-valfleri", image: "/parts/valf.svg" },

  {
    slug: "oto-klima-hortumu",
    name: "Oto Klima Hortumu",
    image: "/parts/hortum.svg",
    inMainNav: true,
    description: "Yüksek ve alçak basınç klima hortumları, rekor ve bağlantı elemanları.",
  },
  {
    slug: "oto-klima-gazi",
    name: "Oto Klima Gazı",
    image: "/parts/gaz.svg",
    description: "R134a ve R1234yf soğutucu akışkanlar, orijinal ambalajında.",
  },
  { slug: "r134a-gazi", name: "R134a Klima Gazı", parent: "oto-klima-gazi", image: "/parts/gaz.svg" },
  { slug: "r1234yf-gazi", name: "R1234yf Klima Gazı", parent: "oto-klima-gazi", image: "/parts/gaz.svg" },

  {
    slug: "klima-sibobu",
    name: "Klima Sibobu",
    image: "/parts/valf.svg",
    description: "Alçak ve yüksek basınç siboplar, valf iğneleri ve kapakları.",
  },
  {
    slug: "servis-cihazlari",
    name: "Servis Cihazları",
    image: "/parts/servis.svg",
    description: "Klima gaz dolum cihazları, vakum pompaları ve kaçak dedektörleri.",
  },
  {
    slug: "servis-ekipmanlari",
    name: "Servis Ekipmanları",
    image: "/parts/servis.svg",
    description: "Manometre setleri, hortum takımları, adaptörler ve atölye sarf malzemeleri.",
  },
  {
    slug: "klima-kimyasal-sivilari",
    name: "Klima Kimyasal Sıvıları",
    image: "/parts/kimyasal.svg",
    inMainNav: true,
    description: "Kompresör yağları, boyalı kaçak tespit sıvıları ve klima temizleme ürünleri.",
  },
  {
    slug: "oto-klima-evaporator",
    name: "Oto Klima Evaporatör",
    image: "/parts/evaporator.svg",
    description: "Araca özel ve üniversal evaporatör peteği modelleri.",
  },
  {
    slug: "dizel-isitici",
    name: "Dizel Isıtıcı",
    image: "/parts/isitici.svg",
    description: "Park ısıtıcıları, dizel ısıtıcı setleri ve yedek parçaları.",
  },
  {
    slug: "klima-kurutucu-filtre",
    name: "Klima Kurutucu Filtre ( Drayer )",
    image: "/parts/drayer.svg",
    description: "Kurutucu filtre (drayer) ve akümülatör modelleri.",
  },
  {
    slug: "klima-rekor",
    name: "Klima Rekor",
    image: "/parts/hortum.svg",
    description: "Hortum rekorları, düz ve açılı bağlantı elemanları.",
  },
  {
    slug: "klima-oring-pul",
    name: "Klima Oring - Pul",
    image: "/parts/oring.svg",
    description: "O-ring setleri, bakır ve alüminyum pullar, sızdırmazlık elemanları.",
  },
  {
    slug: "klima-musuru",
    name: "Klima Müşürü",
    image: "/parts/valf.svg",
    description: "Basınç müşürleri (presostat) ve klima basınç switchleri.",
  },
];
