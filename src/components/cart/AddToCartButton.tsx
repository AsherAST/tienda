"use client";

type Props = {
  productId: string;
  stock: number;
};

export function AddToCartButton({ productId, stock }: Props) {
  const disabled = stock === 0;

  return (
    <button
      type="button"
      data-product-id={productId}
      disabled={disabled}
      className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {disabled ? "Agotado" : "Agregar al carrito"}
    </button>
  );
}
