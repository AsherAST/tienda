import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockDb, cookieStore } = vi.hoisted(() => {
  const cookieStore = new Map<string, { value: string }>();
  return {
    mockDb: {
      product: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
    },
    cookieStore,
  };
});

vi.mock("@/lib/db", () => ({ db: mockDb }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => {
      cookieStore.set(name, { value });
    },
  }),
}));

import { addToCart, updateQuantity, removeFromCart } from "@/app/actions/cart";
import { cartCookieName, serializeCart } from "@/lib/cart";

const product = {
  id: "p1",
  name: "Teclado",
  slug: "teclado",
  price: 8990,
  imageUrl: null,
  stock: 5,
};

function seedCart(items: { id: string; qty: number }[]) {
  cookieStore.set(cartCookieName, { value: serializeCart(items) });
}

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.clear();
  mockDb.product.findMany.mockResolvedValue([product]);
});

describe("addToCart", () => {
  it("devuelve error si el producto no existe", async () => {
    mockDb.product.findUnique.mockResolvedValue(null);
    const result = await addToCart("nope");
    expect(result.error).toBe("Producto no encontrado.");
  });

  it("devuelve error si está agotado", async () => {
    mockDb.product.findUnique.mockResolvedValue({ id: "p1", stock: 0 });
    const result = await addToCart("p1");
    expect(result.error).toBe("Producto agotado.");
  });

  it("agrega un producto nuevo al carrito", async () => {
    mockDb.product.findUnique.mockResolvedValue({ id: "p1", stock: 5 });
    const result = await addToCart("p1", 2);
    expect(result.error).toBeUndefined();
    expect(result.cart.items).toHaveLength(1);
    expect(result.cart.count).toBe(2);
    expect(result.cart.subtotal).toBe(8990 * 2);
  });

  it("incrementa la cantidad respetando el stock", async () => {
    seedCart([{ id: "p1", qty: 4 }]);
    mockDb.product.findUnique.mockResolvedValue({ id: "p1", stock: 5 });
    const result = await addToCart("p1", 1);
    expect(result.cart.items[0].qty).toBe(5);
  });
});

describe("updateQuantity", () => {
  it("actualiza la cantidad y la limita al stock", async () => {
    seedCart([{ id: "p1", qty: 1 }]);
    mockDb.product.findUnique.mockResolvedValue({ id: "p1", stock: 3 });
    const result = await updateQuantity("p1", 10);
    expect(result.cart.items[0].qty).toBe(3);
  });

  it("mantiene mínimo 1", async () => {
    seedCart([{ id: "p1", qty: 2 }]);
    mockDb.product.findUnique.mockResolvedValue({ id: "p1", stock: 5 });
    const result = await updateQuantity("p1", 0);
    expect(result.cart.items[0].qty).toBe(1);
  });
});

describe("removeFromCart", () => {
  it("elimina el item del carrito", async () => {
    seedCart([
      { id: "p1", qty: 2 },
      { id: "p2", qty: 1 },
    ]);
    mockDb.product.findMany.mockResolvedValue([
      product,
      { ...product, id: "p2" },
    ]);
    const result = await removeFromCart("p1");
    expect(result.cart.items.map((i) => i.id)).toEqual(["p2"]);
  });
});
