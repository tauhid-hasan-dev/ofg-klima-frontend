/**
 * DIA "Özel-Grup Kodu" list — requirement 1.
 *
 * Read verbatim off the ERP's [SİS3500] Özel-Grup Kodu Listesi screen in the
 * client's brief (page 1), plus the Grup Kodu column of the stock listing on
 * page 10 (TESİSATLAR, TERMOSTAT). The on-screen list was cut off after
 * SETLER, so codes after it alphabetically may be missing; `resolveGroupCode`
 * is built to cope with that rather than throw.
 *
 * `code` is the authority. The import keys on it, so a product arriving from
 * DIA lands in the right website category with no manual mapping step — which
 * is the whole point of the requirement, and what makes requirement 15 (new
 * products appear automatically, correctly priced) work.
 *
 * `category` names the website category the code resolves to. Where a code has
 * no curated shopper-facing home, it becomes a category in its own right (see
 * `categories.ts`, which appends every unclaimed code).
 */

export interface DiaGroupCode {
  /** Verbatim DIA group code — matched case-insensitively. */
  code: string;
  /** Website category slug this code belongs to. */
  category: string;
}

export const diaGroupCodes: DiaGroupCode[] = [
  { code: "APARATLAR", category: "aparatlar" },
  { code: "BİLYALAR", category: "bilyalar" },
  { code: "BOBİNLER", category: "manyetik-bobin" },
  { code: "BRAKETLER", category: "braketler" },
  { code: "DRAYERLER", category: "klima-kurutucu-filtre" },
  { code: "ELEKTRİKLİ TAVAN KLİMASI", category: "elektrikli-tavan-klimasi" },
  { code: "EVAPARATÖR", category: "oto-klima-evaporator" },
  { code: "EXPANSİON VALF", category: "ekspansiyon-valfi" },
  { code: "FANLAR", category: "klima-fani" },
  { code: "FLATÖRLER", category: "flatorler" },
  { code: "GAZ", category: "oto-klima-gazi" },
  { code: "GAZ BASMA VE MANİFOLD", category: "gaz-basma-manifold" },
  { code: "HORTUM APARATLARI", category: "hortum-aparatlari" },
  { code: "HORTUMLAR", category: "oto-klima-hortumu" },
  { code: "İĞNELER", category: "igneler" },
  { code: "KALORİFER PETEĞİ", category: "kalorifer-petegi" },
  { code: "KASNAK SETLERİ", category: "klima-kasnak-seti" },
  { code: "KEÇELER", category: "keceler" },
  { code: "KİMYASAL SIVI VE YAĞ", category: "klima-kimyasal-sivilari" },
  { code: "KLAPE MOTORLARI", category: "klape-motorlari" },
  { code: "KOMPRESÖR KAPAKLARI", category: "kompresor-kapaklari" },
  { code: "KOMPRESÖRLER", category: "klima-kompresoru" },
  { code: "KONTROL VALF FLATÖR", category: "kontrol-valfi" },
  { code: "MÜŞÜRLER", category: "klima-musuru" },
  { code: "ORİNG VE PULLAR", category: "klima-oring-pul" },
  { code: "PANEL - DÜĞME", category: "panel-dugme" },
  { code: "PLAYT KLAÇ", category: "baski-plakasi" },
  { code: "PRES MAKİNALARI", category: "pres-makinalari" },
  { code: "RADYATÖRLER", category: "klima-radyatoru" },
  { code: "REKORLAR", category: "klima-rekor" },
  { code: "REZİSTANS VE FAN MOTORLARI", category: "rezistans-fan-motorlari" },
  { code: "SAC LAR", category: "saclar" },
  { code: "SETLER", category: "setler" },
  { code: "TERMOSTAT", category: "termostat" },
  { code: "TESİSATLAR", category: "tesisatlar" },
];

/**
 * Codes with no curated category above. Each becomes a top-level-or-nested
 * category so the group still exists on the site, as the requirement asks.
 * `parent` places it somewhere sensible in the shopper's tree.
 */
export const derivedCategories: Array<{
  code: string;
  slug: string;
  name: string;
  parent?: string;
  image: string;
}> = [
  { code: "APARATLAR", slug: "aparatlar", name: "Aparatlar", parent: "servis-ekipmanlari", image: "/parts/servis.svg" },
  { code: "BİLYALAR", slug: "bilyalar", name: "Bilyalar", parent: "kompresor-yedek-parca", image: "/parts/kasnak.svg" },
  { code: "BRAKETLER", slug: "braketler", name: "Braketler", parent: "kompresor-yedek-parca", image: "/parts/kasnak.svg" },
  { code: "ELEKTRİKLİ TAVAN KLİMASI", slug: "elektrikli-tavan-klimasi", name: "Elektrikli Tavan Kliması", image: "/parts/isitici.svg" },
  { code: "FLATÖRLER", slug: "flatorler", name: "Flatörler", parent: "klima-valfleri", image: "/parts/valf.svg" },
  { code: "GAZ BASMA VE MANİFOLD", slug: "gaz-basma-manifold", name: "Gaz Basma ve Manifold", parent: "servis-cihazlari", image: "/parts/servis.svg" },
  { code: "HORTUM APARATLARI", slug: "hortum-aparatlari", name: "Hortum Aparatları", parent: "oto-klima-hortumu", image: "/parts/hortum.svg" },
  { code: "İĞNELER", slug: "igneler", name: "İğneler", parent: "klima-sibobu", image: "/parts/valf.svg" },
  { code: "KALORİFER PETEĞİ", slug: "kalorifer-petegi", name: "Kalorifer Peteği", image: "/parts/evaporator.svg" },
  { code: "KEÇELER", slug: "keceler", name: "Keçeler", parent: "kompresor-yedek-parca", image: "/parts/oring.svg" },
  { code: "KLAPE MOTORLARI", slug: "klape-motorlari", name: "Klape Motorları", parent: "klima-fani", image: "/parts/fan.svg" },
  { code: "KOMPRESÖR KAPAKLARI", slug: "kompresor-kapaklari", name: "Kompresör Kapakları", parent: "kompresor-yedek-parca", image: "/parts/kompresor.svg" },
  { code: "PANEL - DÜĞME", slug: "panel-dugme", name: "Panel ve Düğme", parent: "servis-ekipmanlari", image: "/parts/servis.svg" },
  { code: "PRES MAKİNALARI", slug: "pres-makinalari", name: "Pres Makinaları", parent: "servis-cihazlari", image: "/parts/servis.svg" },
  { code: "REZİSTANS VE FAN MOTORLARI", slug: "rezistans-fan-motorlari", name: "Rezistans ve Fan Motorları", parent: "klima-fani", image: "/parts/fan.svg" },
  { code: "SAC LAR", slug: "saclar", name: "Saclar", parent: "kompresor-yedek-parca", image: "/parts/kasnak.svg" },
  { code: "SETLER", slug: "setler", name: "Setler", parent: "kompresor-yedek-parca", image: "/parts/kasnak.svg" },
  { code: "TESİSATLAR", slug: "tesisatlar", name: "Tesisatlar", parent: "oto-klima-hortumu", image: "/parts/hortum.svg" },
];

/** Normalised for lookup: DIA writes codes in caps, sometimes with odd spacing. */
function normalise(code: string): string {
  return code.trim().toLocaleUpperCase("tr").replace(/\s+/g, " ");
}

const BY_CODE = new Map(diaGroupCodes.map((entry) => [normalise(entry.code), entry.category]));

/**
 * Maps a DIA group code to a website category slug.
 *
 * Returns `undefined` for an unknown code rather than guessing. The import
 * should park those products in a review queue — silently filing a part under
 * the wrong group is worse than leaving it unassigned, because nobody notices.
 */
export function resolveGroupCode(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return BY_CODE.get(normalise(code));
}
