"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  getCartFromCookie,
  buildCartSummary,
  clearCart,
} from "@/lib/cart";

export type PlaceOrderResult = { orderId?: string; error?: string };

export async function placeOrder(): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para confirmar el pedido." };
  }

  const cart = await getCartFromCookie();
  const summary = await buildCartSummary(cart);
  if (summary.items.length === 0) {
    return { error: "Tu carrito está vacío." };
  }

  let orderId: string | undefined;

  try {
    orderId = await db.$transaction(async (tx) => {
      for (const item of summary.items) {
        const result = await tx.product.updateMany({
          where: { id: item.id, stock: { gte: item.qty } },
          data: { stock: { decrement: item.qty } },
        });
        if (result.count === 0) {
          throw new Error("Sin stock suficiente.");
        }
      }

      const order = await tx.order.create({
        data: {
          userId: session.user.id!,
          status: "PAID",
          total: summary.subtotal,
          items: {
            create: summary.items.map((i) => ({
              productId: i.id,
              quantity: i.qty,
              price: i.price,
            })),
          },
        },
      });
      return order.id;
    });
  } catch {
    return { error: "No se pudo completar el pedido. Intenta nuevamente." };
  }

  await clearCart();
  return { orderId };
}
