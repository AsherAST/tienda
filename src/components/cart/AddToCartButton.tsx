"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

type Props = {
  productId: string;
  stock: number;
};

export function AddToCartButton({ productId, stock }: Props) {
  const { add } = useCart();
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const disabled = stock === 0;

  async function handleClick() {
    setPending(true);
    setError(undefined);
    const err = await add(productId);
    setPending(false);
    if (err) {
      setError(err);
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending}
        className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Agregando…"
          : added
            ? "✓ Agregado"
            : disabled
              ? "Agotado"
              : "Agregar al carrito"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
