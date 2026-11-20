"use client";

import Link from "next/link";
import { CartIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/store/cart";
import { clsx } from "@/lib/utils";

/**
 * `dark` sits on the white identity row (phones), `light` on the navy action
 * band (lg and up). Only one of the two is ever visible at a given viewport —
 * the header hides the other — so the count never renders twice on screen.
 */
type Tone = "dark" | "light";

const TONES: Record<Tone, string> = {
  dark: "text-ink-800 hover:text-brand-600",
  light: "text-white hover:bg-white/15",
};

export function CartButton({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  const { count, ready } = useCart();

  return (
    <Link
      href="/sepet"
      className={clsx(
        "group flex items-center gap-2 rounded-md px-2 py-2 transition-colors",
        TONES[tone],
        className,
      )}
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
      <span
        className={clsx(
          "hidden text-sm font-semibold sm:inline",
          // On the navy band the label matches the other strip links rather
          // than sitting in a different face beside them.
          tone === "light" && "font-display text-[0.78rem] font-bold tracking-wide uppercase min-[1400px]:text-[0.8rem]",
        )}
      >
        Sepetim
      </span>
      <span className="sr-only">{ready ? `${count} ürün` : ""}</span>
    </Link>
  );
}
