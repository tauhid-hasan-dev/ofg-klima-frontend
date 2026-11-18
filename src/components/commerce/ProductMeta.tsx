import { StarIcon } from "@/components/ui/icons";
import { buildPrice } from "@/lib/currency";
import { formatPrice, formatUsd } from "@/lib/format";
import type { StockStatus } from "@/lib/types";
import { clsx } from "@/lib/utils";

const STOCK_COPY: Record<StockStatus, { label: string; dot: string; text: string }> = {
  in_stock: { label: "Stokta", dot: "bg-stock-in", text: "text-stock-in" },
  low_stock: { label: "Son birkaç adet", dot: "bg-stock-low", text: "text-stock-low" },
  on_order: { label: "Siparişe bağlı", dot: "bg-ink-400", text: "text-ink-500" },
  out_of_stock: { label: "Tükendi", dot: "bg-stock-out", text: "text-stock-out" },
};

export function StockBadge({ status, className }: { status: StockStatus; className?: string }) {
  const copy = STOCK_COPY[status];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 text-xs font-semibold", copy.text, className)}>
      <span className={clsx("h-1.5 w-1.5 rounded-full", copy.dot)} aria-hidden="true" />
      {copy.label}
    </span>
  );
}

export function isOrderable(status: StockStatus): boolean {
  return status !== "out_of_stock";
}

export function Rating({
  value,
  count,
  className,
}: {
  value?: number;
  count?: number;
  className?: string;
}) {
  if (!value) return null;
  const rounded = Math.round(value);

  return (
    <span className={clsx("inline-flex items-center gap-1", className)}>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={clsx("h-3.5 w-3.5", star <= rounded ? "fill-brand-400 text-brand-500" : "text-ink-300")}
          />
        ))}
      </span>
      <span className="text-xs text-ink-500 tabular">
        {value.toFixed(1).replace(".", ",")}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>
      <span className="sr-only">
        5 üzerinden {value.toFixed(1).replace(".", ",")} puan
        {typeof count === "number" ? `, ${count} değerlendirme` : ""}
      </span>
    </span>
  );
}

/**
 * Dual-currency price, laid out the way the client's live site does it:
 *
 *   $340.00  $400.00        ← USD row, list price struck through in red
 *   16.889,81 TL  19.870,36 TL  ← TL row, same treatment
 *
 * USD leads because that is the currency the business quotes and invoices in;
 * TL is the derived figure. Both list prices come from the same USD ratio, so
 * the discount badge can never disagree between the two rows.
 */
export function PriceBlock({
  priceUsd,
  listPriceUsd,
  size = "md",
  className,
}: {
  priceUsd: number;
  listPriceUsd?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const price = buildPrice(priceUsd, listPriceUsd);
  const discount = price.discountPercent;

  return (
    <div className={clsx("flex flex-col gap-0.5", className)}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span
          className={clsx(
            "font-display font-extrabold tracking-tight text-ink-950 tabular",
            size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-[0.95rem]",
          )}
        >
          {formatUsd(price.usd)}
        </span>

        {price.listUsd ? (
          <span
            className={clsx(
              "text-signal-500/80 line-through tabular",
              size === "lg" ? "text-base" : "text-xs",
            )}
          >
            {formatUsd(price.listUsd)}
          </span>
        ) : null}

        {discount ? (
          <span className="rounded bg-signal-500 px-1.5 py-0.5 text-[0.7rem] font-bold text-white tabular">
            %{discount}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2">
        <span
          className={clsx(
            "font-semibold text-ink-700 tabular",
            size === "lg" ? "text-xl" : size === "md" ? "text-[0.95rem]" : "text-sm",
          )}
        >
          {formatPrice(price.try)}
        </span>

        {price.listTry ? (
          <span
            className={clsx(
              "text-signal-500/70 line-through tabular",
              size === "lg" ? "text-sm" : "text-[0.7rem]",
            )}
          >
            {formatPrice(price.listTry)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Stock count the way their product page prints it: a bare number, in green. */
export function StockCount({ quantity, className }: { quantity: number; className?: string }) {
  return (
    <span className={clsx("font-semibold tabular", quantity > 0 ? "text-stock-in" : "text-stock-out", className)}>
      {quantity > 0 ? quantity : "—"}
    </span>
  );
}
