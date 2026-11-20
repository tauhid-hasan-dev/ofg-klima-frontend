"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CartIcon, CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import { clsx } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";

/**
 * Adds a product to the cart and confirms it inline for ~2s. An inline
 * confirmation beats a toast here: on a listing page the customer's eye is
 * already on the card they clicked.
 */
export function AddToCartButton({
  productId,
  quantity = 1,
  disabled,
  size = "md",
  fullWidth = true,
  label = "Sepete Ekle",
}: {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function onClick() {
    add(productId, quantity);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      size={size}
      fullWidth={fullWidth}
      variant={added ? "secondary" : "primary"}
      aria-live="polite"
    >
      {added ? (
        <>
          <CheckIcon className="h-5 w-5" />
          Sepete eklendi
        </>
      ) : (
        <>
          <CartIcon className="h-5 w-5" />
          {label}
        </>
      )}
    </Button>
  );
}

/**
 * Compact "− qty + 🛒" control that lives directly on a listing card.
 *
 * Copied from the client's own B2B listings: a trade buyer ordering twelve
 * o-rings and three compressors should never have to open a product page to
 * set a quantity. Unusual for B2C, standard for wholesale.
 */
export function CardQuantityAdd({
  productId,
  disabled,
  max = 99,
}: {
  productId: string;
  disabled?: boolean;
  max?: number;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function clamp(next: number) {
    if (!Number.isFinite(next)) return 1;
    return Math.min(max, Math.max(1, Math.floor(next)));
  }

  function onAdd() {
    add(productId, quantity);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex h-9 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-ink-300">
        <button
          type="button"
          onClick={() => setQuantity(clamp(quantity - 1))}
          disabled={disabled || quantity <= 1}
          aria-label="Adedi azalt"
          className="grid w-8 shrink-0 place-items-center text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-40"
        >
          <MinusIcon className="h-3.5 w-3.5" />
        </button>

        <label className="sr-only" htmlFor={`card-qty-${productId}`}>
          Adet
        </label>
        <input
          id={`card-qty-${productId}`}
          type="number"
          inputMode="numeric"
          value={quantity}
          min={1}
          max={max}
          disabled={disabled}
          onChange={(event) => setQuantity(clamp(Number(event.target.value)))}
          className="w-full min-w-0 border-x border-ink-300 text-center text-sm font-semibold text-ink-900 outline-none tabular [appearance:textfield] disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => setQuantity(clamp(quantity + 1))}
          disabled={disabled || quantity >= max}
          aria-label="Adedi artır"
          className="grid w-8 shrink-0 place-items-center text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-40"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        aria-label={added ? "Sepete eklendi" : "Sepete ekle"}
        aria-live="polite"
        className={clsx(
          "grid h-9 w-10 shrink-0 place-items-center rounded-md transition-colors disabled:opacity-40",
          added ? "bg-navy-900 text-brand-400" : "bg-brand-500 text-white hover:bg-brand-600",
        )}
      >
        {added ? <CheckIcon className="h-4 w-4" strokeWidth={2.5} /> : <CartIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

/** Quantity stepper used on the product page and in the cart. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = "Adet",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  function clamp(next: number) {
    return Math.min(max, Math.max(min, next));
  }

  return (
    <div className="inline-flex h-11 items-stretch overflow-hidden rounded-md border border-ink-300">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Adedi azalt"
        className="grid w-10 place-items-center text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-40"
      >
        <MinusIcon className="h-4 w-4" />
      </button>

      <label className="sr-only" htmlFor={`qty-${label}`}>
        {label}
      </label>
      <input
        id={`qty-${label}`}
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className="w-12 border-x border-ink-300 text-center text-sm font-semibold text-ink-900 outline-none tabular [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Adedi artır"
        className="grid w-10 place-items-center text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-40"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
