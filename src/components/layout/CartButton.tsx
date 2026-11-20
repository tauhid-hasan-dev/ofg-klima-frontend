"use client";

import Link from "next/link";
import { CartIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/store/cart";
import { clsx } from "@/lib/utils";

/**
 * `surface` is the header's action row — a raised tile matching the
 * KATEGORİLER trigger and the search field beside it. `bare` is the phone's
 * identity row, where there is no room for a tile and the icon stands alone.
 *
 * Only one is ever visible at a given viewport — the header hides the other —
 * so the item count never renders twice on screen.
 */
type Tone = "bare" | "surface";

/** Rounding and padding live in the tone: the tile needs far more of both. */
const TONES: Record<Tone, string> = {
  bare: "rounded-md px-2 py-2 text-ink-800 hover:text-brand-600",
  surface: "control-surface h-12 rounded-lg px-4 text-ink-800 hover:text-navy-700",
};

export function CartButton({ tone = "bare", className }: { tone?: Tone; className?: string }) {
  const { count, ready } = useCart();

  return (
    <Link
      href="/sepet"
      className={clsx("group flex items-center gap-2 transition-colors", TONES[tone], className)}
    >
      <span className="relative">
        <CartIcon className="h-6 w-6" />
        {/* Rendered only after hydration — the server has no way to know the
            localStorage cart, and a 0 flashing to 3 looks broken. */}
        {ready && count > 0 ? (
          <span className="absolute -top-1.5 -right-2 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-signal-500 px-1 text-[0.65rem] font-bold text-white tabular">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="hidden text-sm font-semibold whitespace-nowrap sm:inline">Sepetim</span>
      <span className="sr-only">{ready ? `${count} ürün` : ""}</span>
    </Link>
  );
}
