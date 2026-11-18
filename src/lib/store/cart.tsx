"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/types";

/**
 * Frontend-only cart.
 *
 * Lines store `productId` + `quantity` only — never a price snapshot. Prices
 * move, and a cart that remembers a stale one is a support ticket waiting to
 * happen. The listing pages resolve ids back to products at render time, and
 * the future backend will do the same at checkout.
 */

const STORAGE_KEY = "ofg.cart.v1";
const MAX_QUANTITY = 99;

type CartAction =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; productId: string; quantity: number }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

function clamp(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

/**
 * `ready` lives in the reducer rather than a sibling `useState` so hydration is
 * a single dispatch. Two separate state updates in the mount effect would mean
 * two commits — and React flags that as a cascading render.
 */
interface CartState {
  lines: CartLine[];
  ready: boolean;
}

const INITIAL_STATE: CartState = { lines: [], ready: false };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines, ready: true };

    case "add": {
      const existing = state.lines.find((line) => line.productId === action.productId);
      const lines = existing
        ? state.lines.map((line) =>
            line.productId === action.productId
              ? { ...line, quantity: clamp(line.quantity + action.quantity) }
              : line,
          )
        : [...state.lines, { productId: action.productId, quantity: clamp(action.quantity) }];
      return { ...state, lines };
    }

    case "setQuantity":
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.productId === action.productId ? { ...line, quantity: clamp(action.quantity) } : line,
        ),
      };

    case "remove":
      return { ...state, lines: state.lines.filter((line) => line.productId !== action.productId) };

    case "clear":
      return { ...state, lines: [] };

    default:
      return state;
  }
}

interface CartContextValue {
  lines: CartLine[];
  /** Total number of units. */
  count: number;
  /**
   * False until the localStorage read has run. Components use this to avoid
   * rendering a count on the server that the client is about to contradict.
   */
  ready: boolean;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function parseStored(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((line): line is CartLine =>
        typeof line === "object" &&
        line !== null &&
        typeof (line as CartLine).productId === "string" &&
        typeof (line as CartLine).quantity === "number",
      )
      .map((line) => ({ productId: line.productId, quantity: clamp(line.quantity) }));
  } catch {
    // Corrupted or tampered-with storage: start clean rather than crash.
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [{ lines, ready }, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Read once on mount. Rendering starts from an empty cart on both server and
  // client, so the first paint always matches.
  useEffect(() => {
    dispatch({ type: "hydrate", lines: parseStored(window.localStorage.getItem(STORAGE_KEY)) });
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private browsing / quota exceeded — the cart stays in memory.
    }
  }, [lines, ready]);

  // Keep tabs in sync; a customer comparing parts across tabs is common here.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      dispatch({ type: "hydrate", lines: parseStored(event.newValue) });
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((productId: string, quantity = 1) => {
    dispatch({ type: "add", productId, quantity });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "setQuantity", productId, quantity });
  }, []);

  const remove = useCallback((productId: string) => {
    dispatch({ type: "remove", productId });
  }, []);

  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((total, line) => total + line.quantity, 0),
      ready,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, ready, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart, <CartProvider> içinde kullanılmalıdır.");
  return context;
}
