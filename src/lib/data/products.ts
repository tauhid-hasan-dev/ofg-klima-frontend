import { photoForFamily } from "@/lib/data/media";
import type { Product, ProductSpec, StockStatus } from "@/lib/types";

/**
 * Catalogue fixtures.
 *
 * Rows are kept as tuples so the table stays readable and diffable; everything
 * derivable (slug, SKU, rating, specs, dates) is computed from a string hash so
 * the output is byte-identical on the server and the client. No Math.random and
 * no Date.now anywhere in this module — those would cause hydration mismatches.
 */

type Row = [
  name: string,
  brandSlug: string,
  categorySlug: string,
  oem: string,
  listPriceUsd: number,
  stock: StockStatus,
  vehicles: string[],
];

const rows: Row[] = [
  // ── Sanden — klima kompresörü ──────────────────────────────────────────
  ["SANDEN 6634 SD5S14 KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD5S14-6634", 300, "in_stock", ["RENAULT KANGOO 1.5 dCi", "DACIA LOGAN 1.5 dCi"]],
  ["SANDEN 5304 SD5S14 KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD5S14-5304", 300, "in_stock", ["RENAULT CLIO III 1.5 dCi", "NISSAN NOTE 1.5 dCi"]],
  ["SANDEN 1762 / BS030 RENAULT FLUENCE - KADJAR - MEGANE - SCENIC 1.4L KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-1762-BS030", 390, "in_stock", ["RENAULT FLUENCE 1.6 16V", "RENAULT KADJAR 1.2 TCe", "RENAULT MEGANE III 1.4 TCe", "RENAULT SCENIC III 1.4 TCe"]],
  ["SANDEN 1761 / BS029 RENAULT FLUENCE - KADJAR - MEGANE - SCENIC KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-1761-BS029", 410, "in_stock", ["RENAULT FLUENCE 1.5 dCi", "RENAULT MEGANE IV 1.5 dCi"]],
  ["SANDEN 8925 SUMITOMO KLİMA KOMPRESÖRÜ", "sanden", "is-makinesi-klima-kompresoru", "SD-8925", 510, "low_stock", ["SUMITOMO SH210", "SUMITOMO SH240"]],
  ["SANDEN 8873 / 8436 / CS003N BMW 5-6-7 SERIES KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-8873-CS003N", 690, "in_stock", ["BMW 5 SERİSİ F10 520d", "BMW 7 SERİSİ F01 730d"]],
  ["SANDEN 8859 PEUGEOT 208 - CACTUS - C4 KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-8859", 450, "in_stock", ["PEUGEOT 208 1.6 BlueHDi", "CITROEN C4 CACTUS 1.6 BlueHDi"]],
  ["SANDEN 8849 / BS031N MEGANE IV KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-8849-BS031N", 470, "in_stock", ["RENAULT MEGANE IV 1.3 TCe", "RENAULT TALISMAN 1.6 dCi"]],
  ["SANDEN SD7H15 8065 ÜNİVERSAL KLİMA KOMPRESÖRÜ", "sanden", "universal-klima-kompresoru", "SD7H15-8065", 370, "in_stock", ["ÜNİVERSAL 12V 2A"]],
  ["SANDEN SD7H15 4661 ÜNİVERSAL KLİMA KOMPRESÖRÜ 24V", "sanden", "universal-klima-kompresoru", "SD7H15-4661", 400, "in_stock", ["ÜNİVERSAL 24V 1A"]],
  ["SANDEN SD5H14 6630 KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD5H14-6630", 330, "on_order", ["FORD TRANSIT 2.2 TDCi"]],
  ["SANDEN PXE16 1437 AUDI A4 - A5 - Q5 KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "PXE16-1437", 580, "in_stock", ["AUDI A4 B8 2.0 TDI", "AUDI Q5 2.0 TDI"]],
  ["SANDEN PXE16 1877 VOLKSWAGEN PASSAT - TIGUAN KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "PXE16-1877", 550, "in_stock", ["VOLKSWAGEN PASSAT B8 1.6 TDI", "VOLKSWAGEN TIGUAN 2.0 TDI"]],
  ["SANDEN SD6V12 1418 PEUGEOT 206 - 307 KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD6V12-1418", 350, "in_stock", ["PEUGEOT 206 1.4 HDi", "PEUGEOT 307 1.6 HDi"]],
  ["SANDEN SD6V12 1426 CITROEN C3 - XSARA KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD6V12-1426", 350, "low_stock", ["CITROEN C3 1.4 HDi", "CITROEN XSARA 1.6 16V"]],
  ["SANDEN SD7V16 1227 VW GOLF IV - BORA KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD7V16-1227", 370, "in_stock", ["VOLKSWAGEN GOLF IV 1.6", "VOLKSWAGEN BORA 1.9 TDI"]],
  ["SANDEN TRS090 3360 HONDA CIVIC KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "TRS090-3360", 430, "in_stock", ["HONDA CIVIC 1.6 VTEC"]],
  ["SANDEN SD7H15 8231 İŞ MAKİNESİ KLİMA KOMPRESÖRÜ", "sanden", "is-makinesi-klima-kompresoru", "SD7H15-8231", 480, "in_stock", ["CATERPILLAR 320D", "KOMATSU PC200"]],
  ["SANDEN 4471 SD5H14 NEW HOLLAND KLİMA KOMPRESÖRÜ", "sanden", "is-makinesi-klima-kompresoru", "SD5H14-4471", 450, "low_stock", ["NEW HOLLAND TD5050", "CASE JX90"]],
  ["SANDEN 7H15 7975 MERCEDES ACTROS KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD7H15-7975", 630, "in_stock", ["MERCEDES ACTROS MP4", "MERCEDES AXOR 1840"]],
  ["SANDEN SD7H15 8291 ÜNİVERSAL 24V KLİMA KOMPRESÖRÜ", "sanden", "universal-klima-kompresoru", "SD7H15-8291", 410, "in_stock", ["ÜNİVERSAL 24V 2A"]],
  ["SANDEN 1888 / BS045 RENAULT CAPTUR KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-1888-BS045", 480, "in_stock", ["RENAULT CAPTUR 1.5 dCi", "RENAULT CLIO IV 1.5 dCi"]],
  ["SANDEN PXV16 1903 SKODA OCTAVIA KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "PXV16-1903", 540, "on_order", ["SKODA OCTAVIA III 1.6 TDI"]],
  ["SANDEN SD7B10 KLİMA KOMPRESÖRÜ 12V", "sanden", "universal-klima-kompresoru", "SD7B10-7176", 380, "in_stock", ["ÜNİVERSAL 12V"]],
  ["SANDEN 8982 FORD RANGER KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-8982", 600, "in_stock", ["FORD RANGER 2.2 TDCi", "FORD EVEREST 3.2 TDCi"]],
  ["SANDEN 1934 / BS052 DACIA DUSTER KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-1934-BS052", 440, "in_stock", ["DACIA DUSTER 1.5 dCi", "DACIA SANDERO 0.9 TCe"]],
  ["SANDEN SD6V12 1812 FIAT PUNTO KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD6V12-1812", 380, "low_stock", ["FIAT PUNTO 1.3 JTD", "FIAT LINEA 1.3 Multijet"]],
  ["SANDEN 7H13 8111 İŞ MAKİNESİ KLİMA KOMPRESÖRÜ", "sanden", "is-makinesi-klima-kompresoru", "SD7H13-8111", 520, "in_stock", ["JCB 3CX", "HIDROMEK HMK 102B"]],
  ["SANDEN SD5H09 KLİMA KOMPRESÖRÜ", "sanden", "universal-klima-kompresoru", "SD5H09-4310", 320, "in_stock", ["ÜNİVERSAL 12V"]],
  ["SANDEN 1749 RENAULT TRAFIC - MASTER KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-1749", 470, "in_stock", ["RENAULT TRAFIC II 2.0 dCi", "RENAULT MASTER III 2.3 dCi"]],
  ["SANDEN PXE13 1621 VW POLO - SEAT IBIZA KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "PXE13-1621", 500, "in_stock", ["VOLKSWAGEN POLO 1.6 TDI", "SEAT IBIZA 1.2 TSI"]],
  ["SANDEN 8713 TOYOTA HILUX KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-8713", 650, "in_stock", ["TOYOTA HILUX 2.5 D-4D"]],
  ["SANDEN SD7H15 8061 OTOBÜS KLİMA KOMPRESÖRÜ", "sanden", "universal-klima-kompresoru", "SD7H15-8061", 590, "in_stock", ["ÜNİVERSAL OTOBÜS 24V"]],
  ["SANDEN 1911 NISSAN QASHQAI KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-1911", 530, "low_stock", ["NISSAN QASHQAI 1.5 dCi", "NISSAN X-TRAIL 1.6 dCi"]],
  ["SANDEN 7H15 4818 MAN TGA KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD7H15-4818", 690, "in_stock", ["MAN TGA 18.440", "MAN TGX 18.480"]],
  ["SANDEN 8871 BMW 1-3 SERIES KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-8871", 720, "in_stock", ["BMW 3 SERİSİ F30 320d", "BMW 1 SERİSİ F20 116d"]],
  ["SANDEN SD6V12 1438 OPEL CORSA C KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD6V12-1438", 340, "in_stock", ["OPEL CORSA C 1.3 CDTI"]],
  ["SANDEN 1884 MERCEDES SPRINTER KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-1884", 640, "in_stock", ["MERCEDES SPRINTER 313 CDI", "VOLKSWAGEN CRAFTER 2.5 TDI"]],
  ["SANDEN 7V16 1201 AUDI A3 KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD7V16-1201", 470, "in_stock", ["AUDI A3 8L 1.9 TDI"]],
  ["SANDEN 8982R HYUNDAI H350 KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-8982R", 560, "on_order", ["HYUNDAI H350 2.5 CRDi"]],
  ["SANDEN SD7H15 9537 ÜNİVERSAL KLİMA KOMPRESÖRÜ", "sanden", "universal-klima-kompresoru", "SD7H15-9537", 440, "in_stock", ["ÜNİVERSAL 12V 2A"]],
  ["SANDEN 1927 FORD FOCUS IV KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-1927", 570, "in_stock", ["FORD FOCUS IV 1.5 EcoBlue"]],
  ["SANDEN 4722 SD5H14 CLAAS KLİMA KOMPRESÖRÜ", "sanden", "is-makinesi-klima-kompresoru", "SD5H14-4722", 490, "in_stock", ["CLAAS ARION 640", "CLAAS AXION 850"]],
  ["SANDEN 1763 DACIA LODGY KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-1763", 420, "in_stock", ["DACIA LODGY 1.5 dCi", "DACIA DOKKER 1.5 dCi"]],
  ["SANDEN PXE14 1856 VOLVO XC60 KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "PXE14-1856", 740, "low_stock", ["VOLVO XC60 2.0 D4", "VOLVO V60 2.0 D3"]],
  ["SANDEN SD7H15 9196 KLİMA KOMPRESÖRÜ 24V", "sanden", "universal-klima-kompresoru", "SD7H15-9196", 460, "in_stock", ["ÜNİVERSAL 24V"]],
  ["SANDEN 8944 LAND ROVER DISCOVERY KLİMA KOMPRESÖRÜ", "sanden", "oto-klima-kompresoru", "SD-8944", 880, "in_stock", ["LAND ROVER DISCOVERY 4 3.0 TDV6"]],

  // ── Denso ──────────────────────────────────────────────────────────────
  ["DENSO DCP23030 RENAULT MEGANE III KLİMA KOMPRESÖRÜ", "denso", "oto-klima-kompresoru", "DCP23030", 510, "in_stock", ["RENAULT MEGANE III 1.5 dCi", "RENAULT SCENIC III 1.5 dCi"]],
  ["DENSO 6SEU14C TOYOTA COROLLA KLİMA KOMPRESÖRÜ", "denso", "oto-klima-kompresoru", "6SEU14C-4471", 570, "in_stock", ["TOYOTA COROLLA 1.4 D-4D", "TOYOTA AURIS 1.4 D-4D"]],
  ["DENSO 7SEU17C MERCEDES C SERİSİ KLİMA KOMPRESÖRÜ", "denso", "oto-klima-kompresoru", "7SEU17C-7861", 710, "in_stock", ["MERCEDES C SERİSİ W204 220 CDI"]],
  ["DENSO DCP32045 VW GOLF V KLİMA KOMPRESÖRÜ", "denso", "oto-klima-kompresoru", "DCP32045", 530, "low_stock", ["VOLKSWAGEN GOLF V 1.9 TDI"]],
  ["DENSO DCN23030 RENAULT CLIO IV KONDENSER", "denso", "arac-klima-radyatoru", "DCN23030", 155, "in_stock", ["RENAULT CLIO IV 1.5 dCi"]],
  ["DENSO DCN32012 VW PASSAT B7 KONDENSER", "denso", "arac-klima-radyatoru", "DCN32012", 170, "in_stock", ["VOLKSWAGEN PASSAT B7 2.0 TDI"]],
  ["DENSO 10S17C HYUNDAI SANTA FE KLİMA KOMPRESÖRÜ", "denso", "oto-klima-kompresoru", "10S17C-8830", 590, "in_stock", ["HYUNDAI SANTA FE 2.2 CRDi"]],
  ["DENSO DCP17053 MERCEDES SPRINTER KLİMA KOMPRESÖRÜ", "denso", "oto-klima-kompresoru", "DCP17053", 670, "in_stock", ["MERCEDES SPRINTER 315 CDI"]],

  // ── Valeo ──────────────────────────────────────────────────────────────
  ["VALEO 813141 RENAULT KANGOO KLİMA KOMPRESÖRÜ", "valeo", "oto-klima-kompresoru", "VLO-813141", 470, "in_stock", ["RENAULT KANGOO II 1.5 dCi"]],
  ["VALEO 699858 NISSAN QASHQAI KLİMA KOMPRESÖRÜ", "valeo", "oto-klima-kompresoru", "VLO-699858", 520, "in_stock", ["NISSAN QASHQAI 1.6 dCi"]],
  ["VALEO 814080 MERCEDES VITO KLİMA KOMPRESÖRÜ", "valeo", "oto-klima-kompresoru", "VLO-814080", 600, "in_stock", ["MERCEDES VITO 111 CDI", "MERCEDES VIANO 2.2 CDI"]],
  ["VALEO 817807 KONDENSER RENAULT MEGANE IV", "valeo", "arac-klima-radyatoru", "VLO-817807", 165, "in_stock", ["RENAULT MEGANE IV 1.5 dCi"]],
  ["VALEO 818015 KONDENSER DACIA DUSTER", "valeo", "arac-klima-radyatoru", "VLO-818015", 135, "low_stock", ["DACIA DUSTER 1.5 dCi"]],
  ["VALEO 509663 EKSPANSİYON VALFİ", "valeo", "ekspansiyon-valfi", "VLO-509663", 55, "in_stock", ["RENAULT CLIO III", "RENAULT MODUS"]],
  ["VALEO 699050 OPEL ASTRA J KLİMA KOMPRESÖRÜ", "valeo", "oto-klima-kompresoru", "VLO-699050", 510, "in_stock", ["OPEL ASTRA J 1.6 CDTI"]],

  // ── Wutse ──────────────────────────────────────────────────────────────
  ["WUTSE SD7H15 ÜNİVERSAL KLİMA KOMPRESÖRÜ 12V", "wutse", "universal-klima-kompresoru", "WT-7H15-12", 220, "in_stock", ["ÜNİVERSAL 12V 2A"]],
  ["WUTSE 6SEU14C KLİMA KOMPRESÖRÜ", "wutse", "oto-klima-kompresoru", "WT-6SEU14C", 240, "in_stock", ["TOYOTA COROLLA 1.4 D-4D"]],
  ["WUTSE RENAULT MEGANE IV KASNAK SETİ", "wutse", "klima-kasnak-seti", "WT-KS-MG4", 80, "in_stock", ["RENAULT MEGANE IV 1.5 dCi"]],
  ["WUTSE SD6V12 KOMPRESÖR KASNAĞI", "wutse", "kompresor-kasnagi", "WT-KSN-6V12", 45, "in_stock", ["PEUGEOT 307", "CITROEN C4"]],
  ["WUTSE PXE16 MANYETİK BOBİN 12V", "wutse", "manyetik-bobin", "WT-BOB-PXE16", 35, "in_stock", ["AUDI A4 B8", "VOLKSWAGEN PASSAT B7"]],
  ["WUTSE SD7H15 BASKI PLAKASI", "wutse", "baski-plakasi", "WT-BP-7H15", 22.5, "in_stock", ["ÜNİVERSAL"]],
  ["WUTSE CVC DELPHI KASNAK SETİ", "wutse", "klima-kasnak-seti", "WT-KS-CVC", 75, "low_stock", ["OPEL ASTRA H", "OPEL ZAFIRA B"]],
  ["WUTSE 6SBU16C KASNAK SETİ", "wutse", "klima-kasnak-seti", "WT-KS-6SBU16C", 85, "in_stock", ["MERCEDES C SERİSİ W204"]],
  ["WUTSE DKS17 KOMPRESÖR KASNAĞI", "wutse", "kompresor-kasnagi", "WT-KSN-DKS17", 50, "in_stock", ["NISSAN PRIMASTAR", "RENAULT TRAFIC II"]],
  ["WUTSE 10PA17C MANYETİK BOBİN 24V", "wutse", "manyetik-bobin", "WT-BOB-10PA17C", 40, "in_stock", ["ÜNİVERSAL 24V"]],
  ["WUTSE ÜNİVERSAL KLİMA RADYATÖRÜ 16x20", "wutse", "universal-klima-radyatoru", "WT-RAD-1620", 100, "in_stock", ["ÜNİVERSAL"]],
  ["WUTSE ÜNİVERSAL KLİMA RADYATÖRÜ 18x24", "wutse", "universal-klima-radyatoru", "WT-RAD-1824", 115, "in_stock", ["ÜNİVERSAL"]],

  // ── Safkar / Nissens / Mahle / Behr — kondenser & fan ──────────────────
  ["EG MAKİNA OTOBÜS KLİMA RADYATÖRÜ 24V", "eg-makina", "universal-klima-radyatoru", "SFK-RAD-24", 300, "in_stock", ["ÜNİVERSAL OTOBÜS"]],
  ["EG MAKİNA EKO 400 KONDANSER GRUBU", "eg-makina", "universal-klima-radyatoru", "SFK-EKO400", 450, "low_stock", ["ÜNİVERSAL MİDİBÜS"]],
  ["MAHLE AC 616 KONDANSER FORD FOCUS", "mahle", "arac-klima-radyatoru", "NIS-94616", 135, "in_stock", ["FORD FOCUS III 1.6 TDCi"]],
  ["MAHLE AC 832 KONDANSER BMW 3 SERİSİ", "mahle", "arac-klima-radyatoru", "NIS-94832", 190, "in_stock", ["BMW 3 SERİSİ F30 320d"]],
  ["MAHLE AC 359 000S KONDENSER", "mahle", "arac-klima-radyatoru", "MHL-AC359", 175, "in_stock", ["VOLKSWAGEN GOLF VI 1.6 TDI"]],
  ["MAHLE AVE 85 000P BLOWER FAN MOTORU", "mahle", "blower-fan", "MHL-AVE85", 95, "in_stock", ["VOLKSWAGEN POLO", "SEAT IBIZA"]],
  ["AC EDGE 8FK 351 AKSİYEL FAN", "ac-edge", "aksiyel-fan", "BHR-8FK351", 110, "in_stock", ["MERCEDES C SERİSİ W204"]],
  ["AC EDGE 8UW 351 EKSPANSİYON VALFİ", "ac-edge", "ekspansiyon-valfi", "BHR-8UW351", 60, "in_stock", ["BMW 5 SERİSİ E60"]],

  // ── Valf / termostat / gaz / hortum / kimyasal ─────────────────────────
  ["SANDEN PXE16 KONTROL VALFİ", "sanden", "kontrol-valfi", "SD-KV-PXE16", 70, "in_stock", ["AUDI A4 B8", "VOLKSWAGEN PASSAT B7"]],
  ["SANDEN 6SEU14C KONTROL VALFİ", "sanden", "kontrol-valfi", "SD-KV-6SEU14C", 65, "in_stock", ["TOYOTA COROLLA", "TOYOTA AURIS"]],
  ["DENSO 7SEU17C KONTROL VALFİ", "denso", "kontrol-valfi", "DNS-KV-7SEU17C", 75, "low_stock", ["MERCEDES C SERİSİ W204"]],
  ["DELPHI CVC KONTROL VALFİ", "delphi", "kontrol-valfi", "DLP-KV-CVC", 55, "in_stock", ["OPEL ASTRA H", "OPEL CORSA D"]],
  ["ÜNİVERSAL KLİMA TERMOSTATI 3 KADEMELİ", "wutse", "termostat", "WT-TRM-3K", 30, "in_stock", ["ÜNİVERSAL"]],
  ["R134A KLİMA GAZI 13.6 KG TÜP", "wutse", "r134a-gazi", "GAZ-R134A-136", 210, "in_stock", ["ÜNİVERSAL"]],
  ["R134A KLİMA GAZI 1 KG BİDON", "wutse", "r134a-gazi", "GAZ-R134A-1", 22.5, "in_stock", ["ÜNİVERSAL"]],
  ["R1234YF KLİMA GAZI 5 KG TÜP", "wutse", "r1234yf-gazi", "GAZ-R1234YF-5", 590, "low_stock", ["ÜNİVERSAL"]],
  ["R1234YF KLİMA GAZI 1 KG BİDON", "wutse", "r1234yf-gazi", "GAZ-R1234YF-1", 130, "in_stock", ["ÜNİVERSAL"]],
  ["ALÇAK BASINÇ KLİMA HORTUMU #8 (1 METRE)", "wutse", "oto-klima-hortumu", "HRT-LP-08", 10, "in_stock", ["ÜNİVERSAL"]],
  ["YÜKSEK BASINÇ KLİMA HORTUMU #6 (1 METRE)", "wutse", "oto-klima-hortumu", "HRT-HP-06", 12.5, "in_stock", ["ÜNİVERSAL"]],
  ["KLİMA HORTUM REKORU DÜZ #8", "wutse", "oto-klima-hortumu", "HRT-RKR-08D", 4.5, "in_stock", ["ÜNİVERSAL"]],
  ["PAG 46 KOMPRESÖR YAĞI 250 ML", "wutse", "klima-kimyasal-sivilari", "KMY-PAG46-250", 8, "in_stock", ["ÜNİVERSAL"]],
  ["PAG 100 KOMPRESÖR YAĞI 250 ML", "wutse", "klima-kimyasal-sivilari", "KMY-PAG100-250", 8.5, "in_stock", ["ÜNİVERSAL"]],
  ["UV KAÇAK TESPİT SIVISI 30 ML", "wutse", "klima-kimyasal-sivilari", "KMY-UV-30", 12.5, "in_stock", ["ÜNİVERSAL"]],
  ["KLİMA PETEK TEMİZLEME KÖPÜĞÜ 400 ML", "wutse", "klima-kimyasal-sivilari", "KMY-TMZ-400", 7, "in_stock", ["ÜNİVERSAL"]],

  // ── Diğer markalar ─────────────────────────────────────────────────────
  ["DOOWON HYUNDAI i30 KLİMA KOMPRESÖRÜ", "doowon", "oto-klima-kompresoru", "DW-I30-977", 490, "in_stock", ["HYUNDAI i30 1.6 CRDi", "KIA CEED 1.6 CRDi"]],
  ["DOOWON HYUNDAI ACCENT BLUE KLİMA KOMPRESÖRÜ", "doowon", "oto-klima-kompresoru", "DW-ACC-977", 450, "in_stock", ["HYUNDAI ACCENT BLUE 1.6 CRDi"]],
  ["HANON VS16 KIA SPORTAGE KLİMA KOMPRESÖRÜ", "hanon", "oto-klima-kompresoru", "HL-VS16-SP", 530, "in_stock", ["KIA SPORTAGE 1.7 CRDi"]],
  ["DENSO CSE613 BMW X3 KLİMA KOMPRESÖRÜ", "denso", "oto-klima-kompresoru", "CLS-CSE613", 770, "low_stock", ["BMW X3 F25 2.0d"]],
  ["KOHLASS DKS32 İŞ MAKİNESİ KLİMA KOMPRESÖRÜ", "kohlass", "is-makinesi-klima-kompresoru", "ZXL-DKS32", 630, "in_stock", ["KOMATSU PC300", "HITACHI ZX330"]],
  ["DELPHI CVC OPEL ASTRA H KLİMA KOMPRESÖRÜ", "delphi", "oto-klima-kompresoru", "DLP-CVC-AH", 410, "in_stock", ["OPEL ASTRA H 1.3 CDTI", "OPEL ZAFIRA B 1.9 CDTI"]],
  ["DELPHI V5 OPEL VECTRA KLİMA KOMPRESÖRÜ", "delphi", "oto-klima-kompresoru", "DLP-V5-VC", 380, "on_order", ["OPEL VECTRA B 1.8 16V"]],
];

/* ── Deterministic helpers ──────────────────────────────────────────────── */

/** FNV-1a. Stable across runtimes, which is the whole point here. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function pick<T>(seed: string, list: readonly T[]): T {
  return list[hash(seed) % list.length];
}

const TURKISH_MAP: Record<string, string> = {
  "ç": "c", "Ç": "c", "ğ": "g", "Ğ": "g", "ı": "i", "İ": "i",
  "ö": "o", "Ö": "o", "ş": "s", "Ş": "s", "ü": "u", "Ü": "u",
};

/**
 * Turkish-aware slug. A naive toLowerCase() turns "İ" into "i̇" (i + combining
 * dot) and leaves "ı" alone, which produces broken URLs — so fold first.
 */
export function slugify(value: string): string {
  return value
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => TURKISH_MAP[char] ?? char)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Which drawing family a category belongs to.
 *
 * Each family has three views in `public/parts/` — `<family>-1` (main),
 * `-2` (angled) and `-3` (detail) — so a product page gallery shows the same
 * part from three sides instead of the same picture three times. They are
 * placeholder renders; OFG's own photography replaces them by dropping files
 * at these paths.
 */
export function partFamily(categorySlug: string): string {
  /*
   * Clutch parts are tested before compressors, not after, because their
   * slugs contain the word "kompresör" too: "kompresor-yedek-parca" and
   * "kompresor-kasnagi" are pulleys and coils, not compressors, and the
   * other order gave both of them a photograph of a whole compressor.
   */
  if (
    categorySlug.includes("kasnak") ||
    categorySlug.includes("kasnag") ||
    categorySlug.includes("yedek-parca") ||
    categorySlug.includes("bobin") ||
    categorySlug.includes("plaka") ||
    categorySlug.includes("playt") ||
    categorySlug.includes("bilya")
  ) {
    return "kasnak";
  }
  if (categorySlug.includes("kompresor") && !categorySlug.includes("kapak")) return "kompresor";
  if (categorySlug.includes("radyator") || categorySlug.includes("kondenser")) return "kondenser";
  if (categorySlug.includes("evaporator") || categorySlug.includes("petegi")) return "evaporator";
  if (categorySlug.includes("drayer") || categorySlug.includes("kurutucu")) return "drayer";
  if (categorySlug.includes("oring") || categorySlug.includes("kece") || categorySlug.includes("pul")) {
    return "oring";
  }
  if (categorySlug.includes("servis") || categorySlug.includes("pres") || categorySlug.includes("manifold")) {
    return "servis";
  }
  if (categorySlug.includes("isitici")) return "isitici";
  if (
    categorySlug.includes("valf") ||
    categorySlug.includes("termostat") ||
    categorySlug.includes("sibob") ||
    categorySlug.includes("musur") ||
    categorySlug.includes("flator")
  ) {
    return "valf";
  }
  if (categorySlug.includes("fan") || categorySlug.includes("klape") || categorySlug.includes("rezistans")) {
    return "fan";
  }
  if (categorySlug.includes("gaz")) return "gaz";
  if (categorySlug.includes("hortum") || categorySlug.includes("rekor") || categorySlug.includes("tesisat")) {
    return "hortum";
  }
  return "kimyasal";
}

/**
 * The gallery for one product: all three views of its family.
 *
 * Still the generated renders rather than photographs, deliberately. Real
 * per-product photography is the intended end state and the path for it is
 * documented in `scripts/build-media-manifest.py` — but one photograph per
 * *family* cannot stand in for it here. Sixty compressor cards showing the
 * same photograph reads as a broken image loader, where sixty renders that
 * differ from one another read as a catalogue. Photography is used where one
 * image genuinely represents the group: see `categoryImage` below.
 *
 * The lead image alternates between views 1 and 2 so a category grid is not
 * sixty copies of one drawing. View 3 is always last and never the thumbnail:
 * it is a close-up of one feature, and a compressor whose card shows only its
 * pulley looks like a pulley for sale.
 */
function productImages(categorySlug: string, h: number): string[] {
  const family = partFamily(categorySlug);
  const lead = (h % 2) + 1;
  const second = lead === 1 ? 2 : 1;
  return [lead, second, 3].map((view) => `/parts/${family}-${view}.svg`);
}

/**
 * The single image that represents a whole category — the category card on the
 * home page, the mega-menu panel, the listing header.
 *
 * This is the one place a per-family photograph is the right unit, so it uses
 * a real one wherever `public/categories/` has it and falls back to the
 * family's render otherwise.
 */
export function categoryImage(categorySlug: string, fallback: string): string {
  return photoForFamily(partFamily(categorySlug)) ?? fallback;
}

function buildSpecs(row: Row, seed: string): ProductSpec[] {
  const categorySlug = row[2];
  const common: ProductSpec[] = [
    { label: "Ürün Kodu", value: row[3] },
    { label: "Menşei", value: pick(seed + "origin", ["Japonya", "Çin", "Türkiye", "Fransa", "Almanya", "Güney Kore"]) },
    { label: "Garanti", value: pick(seed + "warranty", ["12 Ay", "18 Ay", "24 Ay"]) },
  ];

  if (categorySlug.includes("kompresor")) {
    return [
      ...common,
      { label: "Voltaj", value: pick(seed + "volt", ["12V", "24V"]) },
      { label: "Kasnak Kanal Sayısı", value: pick(seed + "groove", ["4PK", "5PK", "6PK", "7PK"]) },
      { label: "Kasnak Çapı", value: pick(seed + "dia", ["110 mm", "119 mm", "125 mm", "132 mm"]) },
      { label: "Soğutucu Akışkan", value: pick(seed + "gas", ["R134a", "R1234yf"]) },
      { label: "Yağ Tipi", value: pick(seed + "oil", ["PAG 46", "PAG 100", "PAG 150"]) },
    ];
  }
  if (categorySlug.includes("radyator")) {
    return [
      ...common,
      { label: "Malzeme", value: "Alüminyum" },
      { label: "Ölçü (G x Y x D)", value: pick(seed + "size", ["610 x 380 x 16 mm", "540 x 360 x 16 mm", "680 x 420 x 20 mm"]) },
      { label: "Kurutucu", value: pick(seed + "drier", ["Dahil", "Hariç"]) },
    ];
  }
  if (categorySlug.includes("kasnak") || categorySlug.includes("bobin") || categorySlug.includes("plaka")) {
    return [
      ...common,
      { label: "Voltaj", value: pick(seed + "volt", ["12V", "24V"]) },
      { label: "Kanal Sayısı", value: pick(seed + "groove", ["4PK", "5PK", "6PK", "7PK"]) },
    ];
  }
  return [...common, { label: "Ambalaj", value: pick(seed + "pack", ["Adet", "Kutu", "Takım"]) }];
}

/* ── Build ──────────────────────────────────────────────────────────────── */

/** Units on hand, consistent with the status badge the row declares. */
function stockQuantityFor(stock: StockStatus, h: number): number {
  switch (stock) {
    case "in_stock":
      return 6 + (h % 40);
    case "low_stock":
      return 1 + (h % 4);
    case "on_order":
    case "out_of_stock":
      return 0;
  }
}

/**
 * Dealer discount applied to every line.
 *
 * Read off the client's live catalogue: each product shows a round USD list
 * price struck through, with the selling price exactly 15% below it. Verified
 * against seven observed pairs —
 *
 *   $300 → $255.00   $425 → $361.25   $500 → $425.00
 *   $490 → $416.50   $540 → $459.00   $50  → $42.50
 *
 * — all exact. So the list price is the stored figure and the sell price is
 * derived, not the other way round.
 */
const DEALER_DISCOUNT = 0.15;

export const products: Product[] = rows.map((row, index) => {
  const [name, brandSlug, categorySlug, oem, listPriceUsd, stock, vehicles] = row;
  const seed = `${oem}|${index}`;
  const h = hash(seed);

  const priceUsd = Math.round(listPriceUsd * (1 - DEALER_DISCOUNT) * 100) / 100;

  // Fixed calendar spread so "newest" sorting is meaningful and reproducible.
  const createdAt = new Date(Date.UTC(2024, 3, 1) + (h % 640) * 86_400_000).toISOString().slice(0, 10);

  return {
    id: `P${String(index + 1).padStart(4, "0")}`,
    slug: `${slugify(name).slice(0, 72).replace(/-+$/, "")}-${slugify(oem)}`,
    name,
    brandSlug,
    categorySlug,
    oem,
    // Mirrors the client's "OFG-21025-ORJ" shape: prefix, code, variant suffix.
    sku: `YP-${oem.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12)}-${h % 3 === 0 ? "ORJ" : "MUA"}`,
    // Their ERP leaves this blank on most lines; mirror that rather than invent one.
    barcode: h % 4 === 0 ? `868${String(100000000 + (h % 899999999))}` : undefined,
    priceUsd,
    listPriceUsd,
    stock,
    stockQuantity: stockQuantityFor(stock, h),
    images: productImages(categorySlug, h),
    vehicles,
    specs: buildSpecs(row, seed),
    rating: Math.round((3.9 + (h % 11) / 10) * 10) / 10,
    reviewCount: h % 64,
    createdAt,
    isBestSeller: h % 7 === 0,
  } satisfies Product;
});
