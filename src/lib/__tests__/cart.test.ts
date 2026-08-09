import { describe, expect, it } from "vitest";
import { parseCart, serializeCart, MAX_CART_QTY } from "@/lib/cart";

describe("parseCart", () => {
  it("devuelve [] sin valor", () => {
    expect(parseCart(undefined)).toEqual([]);
  });

  it("parsea un carrito válido", () => {
    expect(parseCart('[{"id":"p1","qty":2},{"id":"p2","qty":1}]')).toEqual([
      { id: "p1", qty: 2 },
      { id: "p2", qty: 1 },
    ]);
  });

  it("ignora JSON inválido", () => {
    expect(parseCart("no-json")).toEqual([]);
  });

  it("ignora items mal formados", () => {
    expect(parseCart('[{"id":"p1","qty":2},"basura",{"qty":1},{"id":"p2"}]')).toEqual([
      { id: "p1", qty: 2 },
    ]);
  });

  it("rechaza qty menor a 1", () => {
    expect(parseCart('[{"id":"p1","qty":0}]')).toEqual([]);
  });

  it("limita la cantidad al máximo", () => {
    expect(parseCart(`[{"id":"p1","qty":${MAX_CART_QTY + 50}}]`)).toEqual([
      { id: "p1", qty: MAX_CART_QTY },
    ]);
  });
});

describe("serializeCart", () => {
  it("hace round-trip", () => {
    const cart = [
      { id: "p1", qty: 3 },
      { id: "p2", qty: 1 },
    ];
    expect(parseCart(serializeCart(cart))).toEqual(cart);
  });
});
