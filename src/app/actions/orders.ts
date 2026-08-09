"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";
import { shippingSchema } from "@/lib/validators";
import {
  getCartFromCookie,
  buildCartSummary,
  clearCart,
} from "@/lib/cart";

export type PlaceOrderResult = { orderId?: string; error?: string };

export type UpdateOrderStatusResult = { ok?: boolean; error?: string };

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<UpdateOrderStatusResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "No autorizado." };
  }

  const allowed = Object.values(OrderStatus);
  if (!allowed.includes(status as OrderStatus)) {
    return { error: "Estado no válido." };
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Pedido no encontrado." };

  await db.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });
  return { ok: true };
}

export async function placeOrder(
  input: unknown,
): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para confirmar el pedido." };
  }

  const parsed = shippingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos de envío.",
    };
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
          shippingName: parsed.data.name,
          shippingAddress: parsed.data.address,
          shippingCity: parsed.data.city,
          shippingPhone: parsed.data.phone,
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
