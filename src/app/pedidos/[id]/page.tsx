import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice, orderStatusInfo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== session?.user?.id) notFound();

  const status = orderStatusInfo(order.status);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
      <p className="text-sm font-medium text-emerald-600">
        ¡Pedido confirmado! Este es un pago simulado: no se realizó ningún
        cobro real.
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">
        Pedido {order.id.slice(-6)}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {new Date(order.createdAt).toLocaleString("es-CL")} ·{" "}
        <span className={status.className}>{status.label}</span>
      </p>
      <ul className="mt-8 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-zinc-500">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <div className="font-semibold">
              {formatPrice(item.price * item.quantity)}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 text-base font-semibold">
        <span>Total</span>
        <span>{formatPrice(order.total)}</span>
      </div>
      <Link
        href="/pedidos"
        className="mt-6 inline-block text-sm underline"
      >
        Volver a mis pedidos
      </Link>
    </main>
  );
}
