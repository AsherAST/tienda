"use server";

import { db } from "@/lib/db";
import {
  getCartFromCookie,
  setCart,
  buildCartSummary,
  MAX_CART_QTY,
} from "@/lib/cart";
import type { CartActionResult } from "@/lib/cart-types";

async function saveAndReturn(cart: import("@/lib/cart-types").CartItem[]) {
  await setCart(cart);
  return { cart: await buildCartSummary(cart) };
}

export async function addToCart(
  productId: string,
  qty = 1,
): Promise<CartActionResult> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true },
  });
  if (!product) return { error: "Producto no encontrado.", cart: await buildCartSummary(await getCartFromCookie()) };
  if (product.stock <= 0) return { error: "Producto agotado.", cart: await buildCartSummary(await getCartFromCookie()) };

  const cart = await getCartFromCookie();
  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock, MAX_CART_QTY);
  } else {
    cart.push({ id: productId, qty: Math.min(qty, product.stock, MAX_CART_QTY) });
  }
  return saveAndReturn(cart);
}

export async function updateQuantity(
  productId: string,
  qty: number,
): Promise<CartActionResult> {
  const cart = await getCartFromCookie();
  const item = cart.find((i) => i.id === productId);
  if (!item) return { cart: await buildCartSummary(cart) };

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });
  const max = Math.min(product?.stock ?? item.qty, MAX_CART_QTY);
  item.qty = Math.min(Math.max(Math.floor(qty), 1), max);
  return saveAndReturn(cart);
}

export async function removeFromCart(
  productId: string,
): Promise<CartActionResult> {
  const cart = await getCartFromCookie();
  const next = cart.filter((i) => i.id !== productId);
  return saveAndReturn(next);
}
