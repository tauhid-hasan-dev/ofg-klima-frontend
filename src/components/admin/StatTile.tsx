import { formatNumber } from "@/lib/format";
import { clsx } from "@/lib/utils";

/** A single headline figure on the admin dashboard. */
export function StatTile({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-card p-5 ring-1",
        accent ? "bg-brand-500 ring-brand-600" : "bg-white ring-ink-200",
      )}
    >
      <p
        className={clsx(
          "text-xs font-semibold tracking-wide uppercase",
          accent ? "text-white/80" : "text-ink-500",
        )}
      >
        {label}
      </p>
      <p
        className={clsx(
          "mt-1.5 font-display text-3xl font-extrabold tracking-tight tabular",
          accent ? "text-white" : "text-ink-950",
        )}
      >
        {formatNumber(value, 0)}
      </p>
      {hint ? (
        <p className={clsx("mt-1 text-xs", accent ? "text-white/80" : "text-ink-500")}>{hint}</p>
      ) : null}
    </div>
  );
}
