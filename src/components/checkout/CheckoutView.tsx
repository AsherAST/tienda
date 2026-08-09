"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { placeOrder } from "@/app/actions/orders";
import { formatPrice } from "@/lib/format";

export function CheckoutView() {
  const router = useRouter();
  const { summary } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function confirm() {
    setPending(true);
    setError(undefined);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const result = await placeOrder();
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else if (result.orderId) {
      router.push(`/pedidos/${result.orderId}`);
    }
  }

  if (summary.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center">
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
      <ul className="flex-1 divide-y divide-zinc-200 rounded-xl border border-zinc-200">
        {summary.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-zinc-500">
                {item.qty} × {formatPrice(item.price)}
              </p>
            </div>
            <div className="font-semibold">{formatPrice(item.lineTotal)}</div>
          </li>
        ))}
      </ul>
      <aside className="h-fit w-full rounded-xl border border-zinc-200 p-6 lg:w-72">
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
        <p className="mt-4 text-xs text-zinc-500">
          Pago simulado: no se realizará ningún cobro real.
        </p>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          disabled={pending}
          onClick={confirm}
          className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Procesando…" : "Confirmar pedido"}
        </button>
      </aside>
    </div>
  );
}
