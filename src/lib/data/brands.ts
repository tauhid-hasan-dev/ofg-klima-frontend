import type { Brand } from "@/lib/types";

/**
 * Part manufacturers.
 *
 * These eleven are read verbatim from the "Markalar" dropdown on the client's
 * Detaylı Arama page (recording, 10:20) and corroborated by the logo strip on
 * their home page. The earlier draft of this file invented Behr, Zexel,
 * Calsonic, Nissens, Halla and Safkar — none of those appear in the dropdown,
 * so they were removed rather than left to mislead whoever builds the importer.
 */
export const brands: Brand[] = [
  {
    slug: "sanden",
    name: "Sanden",
    kind: "manufacturer",
    country: "Japonya",
    headline: "Sanden Klima Kompresörü",
    description:
      "Sanden, oto klima kompresörü üretiminde dünyanın önde gelen markalarından biridir. SD5H14, SD7H15, SD6V12 ve PXE serisi kompresörler ile binek, ticari ve iş makinesi uygulamalarının tamamını kapsar.",
  },
  {
    slug: "wutse",
    name: "Wutse",
    kind: "manufacturer",
    country: "Türkiye",
    headline: "Wutse Klima Kompresörü ve Kasnak Seti",
    description:
      "Wutse, muadil klima kompresörü ve kasnak setlerinde fiyat/performans dengesiyle öne çıkan markadır. Tüm ürünler 12 ay garantilidir.",
  },
  {
    slug: "denso",
    name: "Denso",
    kind: "manufacturer",
    country: "Japonya",
    headline: "Denso Klima Kompresörü",
    description:
      "Denso, OEM tedarikçisi olarak Toyota, Hyundai ve birçok Avrupa üreticisinin ilk montaj kompresörlerini üretir. DCP, 6SEU ve 7SEU serileri stoklarımızda mevcuttur.",
  },
  {
    slug: "valeo",
    name: "Valeo",
    kind: "manufacturer",
    country: "Fransa",
    headline: "Valeo Klima Kompresörü",
    description:
      "Valeo, Renault, Nissan, Dacia ve Mercedes grubu araçlarda yaygın olarak kullanılan klima kompresörleri ve kondanserleri üretir.",
  },
  {
    slug: "mahle",
    name: "Mahle",
    kind: "manufacturer",
    country: "Almanya",
    headline: "Mahle Klima Parçaları",
    description: "Mahle, kondanser, kurutucu ve ekspansiyon valfi gruplarında OE kalitesinde ürünler sunar.",
  },
  {
    slug: "delphi",
    name: "Delphi",
    kind: "manufacturer",
    country: "ABD",
    headline: "Delphi Klima Kompresörü",
    description: "Delphi, GM ve Opel grubu araçlarda yaygın kullanılan CVC ve V5 serisi kompresörleriyle bilinir.",
  },
  {
    slug: "hanon",
    name: "Hanon",
    kind: "manufacturer",
    country: "Güney Kore",
    headline: "Hanon Systems Klima Kompresörü",
    description:
      "Hanon Systems, Ford, Hyundai ve birçok Avrupa üreticisinin orijinal klima kompresörü tedarikçisidir.",
  },
  {
    slug: "doowon",
    name: "Doowon",
    kind: "manufacturer",
    country: "Güney Kore",
    headline: "Doowon Klima Kompresörü",
    description: "Doowon, Hyundai ve Kia araçlarının orijinal klima kompresörü üreticisidir.",
  },
  {
    slug: "ac-edge",
    name: "AC EDGE",
    kind: "manufacturer",
    headline: "AC EDGE Klima Parçaları",
    description: "AC EDGE, geniş muadil kompresör ve kondanser yelpazesiyle servis pazarına yönelik üretim yapar.",
  },
  {
    slug: "kohlass",
    name: "Kohlass",
    kind: "manufacturer",
    headline: "Kohlass Klima Parçaları",
    description: "Kohlass, klima kompresörü ve yedek parça gruplarında ekonomik çözümler sunar.",
  },
  {
    slug: "eg-makina",
    name: "EG Makina",
    kind: "manufacturer",
    country: "Türkiye",
    headline: "EG Makina Klima Ürünleri",
    description: "EG Makina, yerli üretim klima bileşenleri ve servis ekipmanları sağlar.",
  },

  /* Vehicle makes — used by "Araç Markasına Göre Kompresör". */
  { slug: "renault", name: "Renault", kind: "vehicle", headline: "Renault Klima Kompresörü ve Yedek Parçaları" },
  { slug: "ford", name: "Ford", kind: "vehicle", headline: "Ford Klima Kompresörü ve Yedek Parçaları" },
  { slug: "volkswagen", name: "Volkswagen", kind: "vehicle", headline: "Volkswagen Klima Kompresörü ve Yedek Parçaları" },
  { slug: "opel", name: "Opel", kind: "vehicle", headline: "Opel Klima Kompresörü ve Yedek Parçaları" },
  { slug: "hyundai", name: "Hyundai", kind: "vehicle", headline: "Hyundai Klima Kompresörü ve Yedek Parçaları" },
  { slug: "mercedes", name: "Mercedes-Benz", kind: "vehicle", headline: "Mercedes-Benz Klima Kompresörü ve Yedek Parçaları" },
  { slug: "bmw", name: "BMW", kind: "vehicle", headline: "BMW Klima Kompresörü ve Yedek Parçaları" },
  { slug: "peugeot", name: "Peugeot", kind: "vehicle", headline: "Peugeot Klima Kompresörü ve Yedek Parçaları" },
  { slug: "citroen", name: "Citroën", kind: "vehicle", headline: "Citroën Klima Kompresörü ve Yedek Parçaları" },
  { slug: "fiat", name: "Fiat", kind: "vehicle", headline: "Fiat Klima Kompresörü ve Yedek Parçaları" },
  { slug: "toyota", name: "Toyota", kind: "vehicle", headline: "Toyota Klima Kompresörü ve Yedek Parçaları" },
  { slug: "nissan", name: "Nissan", kind: "vehicle", headline: "Nissan Klima Kompresörü ve Yedek Parçaları" },
  { slug: "audi", name: "Audi", kind: "vehicle", headline: "Audi Klima Kompresörü ve Yedek Parçaları" },
  { slug: "dacia", name: "Dacia", kind: "vehicle", headline: "Dacia Klima Kompresörü ve Yedek Parçaları" },
];
