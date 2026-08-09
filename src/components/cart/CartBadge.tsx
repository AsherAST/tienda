"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export function CartBadge() {
  const { count } = useCart();

  return (
    <Link href="/carrito" className="hover:underline">
      Carrito{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
