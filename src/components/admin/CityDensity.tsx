import { formatNumber } from "@/lib/format";

/**
 * Visits by city — requirement 16's density display.
 *
 * ## What this is, and what the client asked for
 *
 * They asked for a map of Türkiye shaded by visit density, and said a
 * prototype was acceptable if KVKK made the real thing awkward. KVKK turned
 * out not to be the obstacle — only the city name is ever stored, never an IP
 * (see `src/app/api/olay/route.ts`). The obstacle is geometry: a true
 * choropleth needs the 81 provincial boundaries as path data, which is an
 * asset this project does not have. Drawing them from memory would put
 * provinces in the wrong places, and a map that is confidently wrong is worse
 * than no map.
 *
 * So this is the same data as a ranked, shaded list: magnitude by bar length,
 * reinforced by a single-hue sequential fill, with the exact count printed.
 * It answers "where do our visitors come from" precisely. Dropping a province
 * SVG into `public/` and keying its paths off `cities` is the remaining step
 * to make it geographic, and nothing about the data pipeline changes.
 *
 * Colour: sequential, so one hue light→dark across the brand red ramp. Never a
 * rainbow — the quantity is ordered, and so is the ramp.
 */

/** Brand red, light → dark. Index is chosen by the value's share of the max. */
const RAMP = ["#ffe0e1", "#ffc6c8", "#fb9ca0", "#f4585e", "#e71a21", "#c7121a"] as const;

function shadeFor(value: number, max: number): string {
  if (max <= 0) return RAMP[0];
  const step = Math.min(RAMP.length - 1, Math.floor((value / max) * RAMP.length));
  return RAMP[step];
}

export function CityDensity({ cities }: { cities: Array<{ city: string; visits: number }> }) {
  if (cities.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-400">Henüz ziyaret kaydı yok.</p>;
  }

  const max = Math.max(...cities.map((entry) => entry.visits));
  const total = cities.reduce((sum, entry) => sum + entry.visits, 0);
  const shown = cities.slice(0, 15);

  return (
    <div>
      <ul className="space-y-1.5">
        {shown.map((entry) => {
          const share = total > 0 ? (entry.visits / total) * 100 : 0;

          return (
            <li key={entry.city} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm text-ink-700" title={entry.city}>
                {entry.city}
              </span>

              <span className="h-5 min-w-0 flex-1 overflow-hidden rounded-sm bg-ink-100">
                <span
                  className="block h-full rounded-sm"
                  style={{
                    // Floor the width so a city with a single visit is still a
                    // visible mark rather than an empty row.
                    width: `${Math.max(1.5, (entry.visits / max) * 100)}%`,
                    backgroundColor: shadeFor(entry.visits, max),
                  }}
                />
              </span>

              <span className="w-24 shrink-0 text-right text-sm text-ink-950 tabular">
                <strong className="font-semibold">{formatNumber(entry.visits, 0)}</strong>
                <span className="ml-1.5 text-xs text-ink-400">%{share.toFixed(1).replace(".", ",")}</span>
              </span>
            </li>
          );
        })}
      </ul>

      {cities.length > shown.length ? (
        <p className="mt-3 text-xs text-ink-500 tabular">
          + {cities.length - shown.length} şehir daha ({formatNumber(
            cities.slice(shown.length).reduce((sum, entry) => sum + entry.visits, 0),
            0,
          )}{" "}
          ziyaret)
        </p>
      ) : null}

      <p className="mt-4 rounded-md bg-ink-50 px-3 py-2 text-xs leading-relaxed text-ink-600">
        <strong className="font-semibold text-ink-900">Harita hakkında:</strong> Bu liste, haritanın besleneceği
        verinin ta kendisidir. Coğrafi harita görünümü için 81 ilin sınır çizimlerini içeren bir SVG dosyasına
        ihtiyaç var; elimizde olmadığı için ili yanlış yere koyan bir harita çizmek yerine veriyi doğrudan
        gösteriyoruz. Dosya eklendiğinde bu bileşen aynı veriyle haritaya dönüşür.
        {cities.some((entry) => entry.city === "Bilinmiyor") ? (
          <>
            {" "}
            <strong className="font-semibold text-ink-900">Not:</strong> &ldquo;Bilinmiyor&rdquo; satırı, şehir
            bilgisini veren bir CDN başlığının bulunmadığı ziyaretlerdir (Vercel veya Cloudflare arkasında
            otomatik gelir).
          </>
        ) : null}
      </p>
    </div>
  );
}
