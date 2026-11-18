"use client";

import Link from "next/link";
import { CartIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/store/cart";

export function CartButton() {
  const { count, ready } = useCart();

  return (
    <Link
      href="/sepet"
      className="group flex items-center gap-2 rounded-md px-2 py-2 text-ink-950 transition-colors hover:bg-ink-950/10"
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
      <span className="hidden text-sm font-semibold sm:inline">Sepetim</span>
      <span className="sr-only">{ready ? `${count} ürün` : ""}</span>
    </Link>
  );
}
