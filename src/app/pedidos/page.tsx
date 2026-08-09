import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice, orderStatusInfo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const session = await auth();
  const orders = await db.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Mis pedidos</h1>
      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-zinc-500">Aún no tienes pedidos.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {orders.map((order) => {
            const status = orderStatusInfo(order.status);
            const productCount = order.items.reduce(
              (n, i) => n + i.quantity,
              0,
            );
            return (
              <li key={order.id}>
                <Link
                  href={`/pedidos/${order.id}`}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-zinc-50"
                >
                  <div>
                    <p className="font-medium">Pedido {order.id.slice(-6)}</p>
                    <p className="text-sm text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString("es-CL")} ·{" "}
                      {productCount}{" "}
                      {productCount === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(order.total)}
                    </p>
                    <p className={`text-sm ${status.className}`}>
                      {status.label}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
