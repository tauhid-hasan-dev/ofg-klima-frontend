type ClassValue = string | number | null | undefined | false | ClassValue[] | Record<string, boolean | undefined>;

/**
 * Minimal class joiner. Deliberately not `tailwind-merge` — this codebase never
 * passes competing utilities for the same CSS property through `className`, so
 * the extra dependency and its runtime cost would buy nothing.
 */
export function clsx(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = clsx(...input);
      if (nested) out.push(nested);
    } else {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key);
      }
    }
  }

  return out.join(" ");
}

/** Turkish-aware alphabetical sort (İ/ı, Ş, Ğ, Ö, Ü order). */
export function compareTr(a: string, b: string): number {
  return a.localeCompare(b, "tr", { sensitivity: "base" });
}

/** [1, 2, …] page numbers with ellipsis gaps, as used by the pager. */
export function paginationRange(current: number, total: number, siblings = 1): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>([1, total, current]);
  for (let offset = 1; offset <= siblings; offset += 1) {
    if (current - offset > 1) pages.add(current - offset);
    if (current + offset < total) pages.add(current + offset);
  }
  // Always show a hint of the start so page 1 is one click away visually.
  if (current <= 4) [2, 3, 4].forEach((page) => page < total && pages.add(page));
  if (current >= total - 3) [total - 1, total - 2, total - 3].forEach((page) => page > 1 && pages.add(page));

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: Array<number | "gap"> = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("gap");
    result.push(page);
  });

  return result;
}
