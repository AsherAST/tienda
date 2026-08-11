"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart,
  updateQuantity,
  removeFromCart,
} from "@/app/actions/cart";
import type { CartSummary } from "@/lib/cart-types";

type CartContextValue = {
  summary: CartSummary;
  count: number;
  subtotal: number;
  add: (productId: string, qty?: number) => Promise<string | undefined>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const emptySummary: CartSummary = { items: [], subtotal: 0, count: 0 };

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: CartSummary;
  children: ReactNode;
}) {
  const [summary, setSummary] = useState<CartSummary>(initialCart ?? emptySummary);

  const add = useCallback(async (productId: string, qty = 1) => {
    const result = await addToCart(productId, qty);
    setSummary(result.cart);
    return result.error;
  }, []);

  const updateQty = useCallback(async (productId: string, qty: number) => {
    const result = await updateQuantity(productId, qty);
    setSummary(result.cart);
  }, []);

  const remove = useCallback(async (productId: string) => {
    const result = await removeFromCart(productId);
    setSummary(result.cart);
  }, []);

  const clear = useCallback(() => {
    setSummary(emptySummary);
  }, []);

  return (
    <CartContext.Provider
      value={{
        summary,
        count: summary.count,
        subtotal: summary.subtotal,
        add,
        updateQty,
        remove,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return ctx;
}
