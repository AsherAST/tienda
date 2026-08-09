"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { summary, updateQty, remove } = useCart();
  const [pendingId, setPendingId] = useState<string | undefined>();

  async function changeQty(productId: string, qty: number) {
    setPendingId(productId);
    if (qty <= 0) {
      await remove(productId);
    } else {
      await updateQty(productId, qty);
    }
    setPendingId(undefined);
  }

  if (summary.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-zinc-500">Tu carrito está vacío.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <ul className="flex-1 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        {summary.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/producto/${item.slug}`}
                className="block truncate font-medium hover:underline"
              >
                {item.name}
              </Link>
              <p className="text-sm text-zinc-500">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Reducir cantidad"
                disabled={pendingId === item.id}
                onClick={() => changeQty(item.id, item.qty - 1)}
                className="h-8 w-8 rounded-lg border border-zinc-300 text-zinc-600 transition-colors hover:border-zinc-500 disabled:opacity-50"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {item.qty}
              </span>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                disabled={pendingId === item.id || item.qty >= item.stock}
                onClick={() => changeQty(item.id, item.qty + 1)}
                className="h-8 w-8 rounded-lg border border-zinc-300 text-zinc-600 transition-colors hover:border-zinc-500 disabled:opacity-50"
              >
                +
              </button>
            </div>
            <div className="w-24 text-right font-semibold">
              {formatPrice(item.lineTotal)}
            </div>
            <button
              type="button"
              aria-label="Eliminar"
              disabled={pendingId === item.id}
              onClick={() => changeQty(item.id, 0)}
              className="text-sm text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-50"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <aside className="h-fit w-full rounded-xl border border-zinc-200 bg-white p-6 lg:w-72">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Productos</dt>
            <dd>{summary.count}</dd>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(summary.subtotal)}</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="mt-6 block rounded-lg bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Finalizar compra
        </Link>
      </aside>
    </div>
  );
}
