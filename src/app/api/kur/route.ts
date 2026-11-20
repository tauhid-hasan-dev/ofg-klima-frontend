import { connection, NextResponse } from "next/server";
import { getRates, refreshRates } from "@/lib/exchange-rate";

/**
 * Exchange-rate endpoint — requirement 10.
 *
 * GET  /api/kur          → the rate currently being used to price the site
 * POST /api/kur          → force a TCMB refresh, then return it
 *
 * TCMB publishes once per working day around 15:30 Europe/Istanbul, so the
 * useful cron is a single POST shortly after that. The site does not depend on
 * the cron — an hourly timer in `src/lib/exchange-rate.ts` refreshes the cache
 * on its own — but a scheduled call makes the new rate appear within minutes
 * of publication rather than within the hour.
 */

/*
 * No `export const dynamic` here: it is incompatible with Next's Cache
 * Components. `await connection()` is the supported way to say "this runs
 * per request" — it marks everything after it as request-time work.
 */

export async function GET() {
  await connection();
  const rates = getRates();
  return NextResponse.json({
    usd: rates.USD,
    eur: rates.EUR,
    asOf: rates.asOf,
    source: rates.source,
  });
}

export async function POST() {
  await connection();
  const rates = await refreshRates();
  return NextResponse.json({
    usd: rates.USD,
    eur: rates.EUR,
    asOf: rates.asOf,
    source: rates.source,
    refreshed: true,
  });
}
