"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { placeOrder } from "@/app/actions/orders";
import { formatPrice } from "@/lib/format";

type Shipping = {
  name: string;
  address: string;
  city: string;
  phone: string;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-zinc-700";

export function CheckoutView({ userName }: { userName?: string }) {
  const router = useRouter();
  const { summary } = useCart();
  const [shipping, setShipping] = useState<Shipping>({
    name: userName ?? "",
    address: "",
    city: "",
    phone: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function set<K extends keyof Shipping>(key: K, value: string) {
    setShipping((prev) => ({ ...prev, [key]: value }));
  }

  async function confirm() {
    setPending(true);
    setError(undefined);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const result = await placeOrder(shipping);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else if (result.orderId) {
      router.push(`/pedidos/${result.orderId}`);
    }
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
      <div className="flex-1 space-y-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Datos de envío</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ship-name" className={labelClass}>
                Nombre de contacto
              </label>
              <input
                id="ship-name"
                required
                value={shipping.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ship-phone" className={labelClass}>
                Teléfono
              </label>
              <input
                id="ship-phone"
                required
                value={shipping.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
                placeholder="+56 9 ..."
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ship-address" className={labelClass}>
                Dirección
              </label>
              <input
                id="ship-address"
                required
                value={shipping.address}
                onChange={(e) => set("address", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ship-city" className={labelClass}>
                Ciudad / Comuna
              </label>
              <input
                id="ship-city"
                required
                value={shipping.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Tu pedido</h2>
          <ul className="mt-4 divide-y divide-zinc-100">
            {summary.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-zinc-500">
                    {item.qty} × {formatPrice(item.price)}
                  </p>
                </div>
                <div className="font-semibold">
                  {formatPrice(item.lineTotal)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

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
