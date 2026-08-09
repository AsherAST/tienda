import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  await auth();

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: { include: { product: true } } },
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Gestiona el estado de los pedidos de los clientes.
      </p>
      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-zinc-500">No hay pedidos aún.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const productCount = order.items.reduce(
              (n, i) => n + i.quantity,
              0,
            );
            return (
              <div
                key={order.id}
                className="rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      Pedido {order.id.slice(-6)}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {order.user.name} ({order.user.email}) ·{" "}
                      {new Date(order.createdAt).toLocaleString("es-CL")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="font-semibold">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-zinc-500">
                        {productCount}{" "}
                        {productCount === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                    <OrderStatusSelect
                      orderId={order.id}
                      current={order.status}
                    />
                  </div>
                </div>
                <ul className="mt-3 divide-y divide-zinc-100 border-t border-zinc-100">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="text-zinc-600">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                {order.shippingName ? (
                  <p className="mt-3 border-t border-zinc-100 pt-3 text-sm text-zinc-500">
                    Envío a: {order.shippingName} · {order.shippingAddress},{" "}
                    {order.shippingCity} · {order.shippingPhone}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
