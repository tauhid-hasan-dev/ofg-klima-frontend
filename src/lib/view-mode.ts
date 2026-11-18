/**
 * Grid/list view preference.
 *
 * Lives in its own framework-agnostic module because both the server (which
 * decides how many columns to render) and the client toolbar (which writes the
 * param) need it. Exporting it from a `"use client"` file would make the server
 * call a client function, which Next.js rejects at render time.
 */

export type ViewMode = "4" | "3" | "liste";

export const VIEW_KEY = "gorunum";

export function parseViewMode(value: string | string[] | undefined): ViewMode {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "3" || raw === "liste" ? raw : "4";
}
