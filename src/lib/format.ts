/**
 * Formatting helpers.
 *
 * These are deliberately hand-rolled rather than `Intl.NumberFormat`: the ICU
 * data bundled with Node can differ from the browser's (notably the space
 * before the currency symbol, which has been a non-breaking space in some
 * versions and a narrow no-break space in others). That difference shows up as
 * a React hydration mismatch on every price on the page. Fixed output removes
 * the whole class of bug.
 */

const TL = "TL";

/** 12749.99 → "12.749,99" */
export function formatNumber(value: number, fractionDigits = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  const [whole, fraction = ""] = Math.abs(safe).toFixed(fractionDigits).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = safe < 0 ? "-" : "";
  return fractionDigits > 0 ? `${sign}${grouped},${fraction}` : `${sign}${grouped}`;
}

/** 12749.99 → "12.749,99 TL" */
export function formatPrice(value: number): string {
  return `${formatNumber(value)} ${TL}`;
}

/**
 * 340 → "$340.00"
 *
 * US convention deliberately — the client's site prints `$340.00`, not
 * `340,00 $`. Mixing Turkish separators into a dollar figure would look like a
 * bug to anyone reading an invoice next to the screen.
 */
export function formatUsd(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const [whole, fraction] = Math.abs(safe).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${safe < 0 ? "-" : ""}$${grouped}.${fraction}`;
}

/** 19870 → "%19" (rounded down, so we never overstate a discount). */
export function discountPercent(price: number, listPrice?: number): number | null {
  if (!listPrice || listPrice <= price) return null;
  return Math.floor(((listPrice - price) / listPrice) * 100);
}

export function formatDiscount(price: number, listPrice?: number): string | null {
  const percent = discountPercent(price, listPrice);
  return percent === null ? null : `%${percent}`;
}

/** "2024-11-05" → "5 Kasım 2024" */
const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${TR_MONTHS[month - 1]} ${year}`;
}

/** Builds a wa.me deep link with a prefilled Turkish enquiry. */
export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** "+905309611905" → "0530 961 19 05" */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^90/, "");
  if (digits.length !== 10) return phone;
  return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
}
