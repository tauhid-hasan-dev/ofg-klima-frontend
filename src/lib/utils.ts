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
