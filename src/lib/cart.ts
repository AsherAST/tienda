import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { CartItem, CartSummary } from "@/lib/cart-types";

export const cartCookieName = "tienda_cart";
export const MAX_CART_QTY = 99;

export function parseCart(value: string | undefined): CartItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i): i is CartItem =>
          !!i &&
          typeof i.id === "string" &&
          typeof i.qty === "number" &&
          i.qty >= 1,
      )
      .map((i) => ({ id: i.id, qty: Math.min(Math.floor(i.qty), MAX_CART_QTY) }));
  } catch {
    return [];
  }
}

export function serializeCart(cart: CartItem[]): string {
  return JSON.stringify(cart);
}

export async function getCartFromCookie(): Promise<CartItem[]> {
  const store = await cookies();
  return parseCart(store.get(cartCookieName)?.value);
}

export async function setCart(cart: CartItem[]) {
  const store = await cookies();
  store.set(cartCookieName, serializeCart(cart), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCart() {
  const store = await cookies();
  store.set(cartCookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function buildCartSummary(cart: CartItem[]): Promise<CartSummary> {
  if (cart.length === 0) return { items: [], subtotal: 0, count: 0 };

  const products = await db.product.findMany({
    where: { id: { in: cart.map((c) => c.id) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: CartSummary["items"] = [];
  let subtotal = 0;
  let count = 0;

  for (const c of cart) {
    const product = byId.get(c.id);
    if (!product || product.stock <= 0) continue;
    const qty = Math.min(c.qty, product.stock, MAX_CART_QTY);
    items.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      qty,
      lineTotal: product.price * qty,
    });
    subtotal += product.price * qty;
    count += qty;
  }

  return { items, subtotal, count };
}

export async function getCartDetailed(): Promise<CartSummary> {
  return buildCartSummary(await getCartFromCookie());
}
