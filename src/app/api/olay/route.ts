import { connection, NextResponse, type NextRequest } from "next/server";
import { record } from "@/lib/analytics/store";
import type { AnalyticsEvent, AnalyticsEventType } from "@/lib/analytics/types";

/**
 * Event intake for the analytics dashboard (requirement 16).
 *
 * The browser posts what happened; the city is resolved **here**, from the
 * CDN's geo headers, and the raw IP is never read or stored. That split is the
 * KVKK answer: the client gets their density map and the server never holds a
 * field that identifies anybody.
 */

/*
 * No `export const dynamic` here: it is incompatible with Next's Cache
 * Components. `await connection()` is the supported way to say "this runs
 * per request" — it marks everything after it as request-time work.
 */

const ALLOWED: ReadonlySet<AnalyticsEventType> = new Set([
  "page_view",
  "search",
  "product_view",
  "whatsapp",
]);

/** Cheap bounds so a malicious client cannot write megabytes into the log. */
function clamp(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

/**
 * City from the edge.
 *
 * Vercel and Cloudflare both expose it; a bare Node deployment behind nginx
 * exposes neither, and the dashboard then shows "Bilinmiyor" rather than a
 * guess. Resolving a city needs either a CDN that does it or a local GeoIP
 * database — it is not something the application can work out on its own.
 */
function cityFrom(request: NextRequest): string {
  const raw =
    request.headers.get("x-vercel-ip-city") ??
    request.headers.get("cf-ipcity") ??
    request.headers.get("x-geo-city");

  if (!raw) return "Bilinmiyor";
  // Vercel percent-encodes it ("Istanbul" is fine, "Kahramanmaraş" is not).
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function POST(request: NextRequest) {
  await connection();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek" }, { status: 400 });
  }

  const payload = body as Partial<AnalyticsEvent>;
  if (typeof payload.type !== "string" || !ALLOWED.has(payload.type as AnalyticsEventType)) {
    return NextResponse.json({ ok: false, error: "Bilinmeyen olay türü" }, { status: 400 });
  }

  const event: AnalyticsEvent = {
    type: payload.type as AnalyticsEventType,
    // Stamped on the server: a client clock can be wrong by years, and the
    // whole dashboard is grouped by day.
    at: new Date().toISOString().slice(0, 19) + "Z",
    path: clamp(payload.path, 256),
    term: clamp(payload.term, 120),
    productId: clamp(payload.productId, 64),
    productName: clamp(payload.productName, 200),
    city: cityFrom(request),
  };

  await record(event);

  // 204: the browser has nothing to do with the answer, and sendBeacon ignores
  // the body anyway.
  return new NextResponse(null, { status: 204 });
}
