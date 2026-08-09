import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockDb, cookieStore, mockAuth } = vi.hoisted(() => {
  const cookieStore = new Map<string, { value: string }>();
  return {
    mockDb: {
      product: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
      },
      order: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    },
    cookieStore,
    mockAuth: vi.fn(),
  };
});

vi.mock("@/lib/db", () => ({ db: mockDb }));
vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => {
      cookieStore.set(name, { value });
    },
  }),
}));

import { placeOrder } from "@/app/actions/orders";
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
  mockAuth.mockResolvedValue({ user: { id: "u1" } });
  mockDb.product.findMany.mockResolvedValue([product]);
  mockDb.product.updateMany.mockResolvedValue({ count: 1 });
  mockDb.order.create.mockImplementation(async ({ data }) => ({
    id: "order-1",
    ...data,
  }));
  mockDb.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) =>
    fn(mockDb),
  );
});

describe("placeOrder", () => {
  it("crea el pedido, descuenta stock y limpia el carrito", async () => {
    seedCart([{ id: "p1", qty: 2 }]);
    const result = await placeOrder();

    expect(result.error).toBeUndefined();
    expect(result.orderId).toBe("order-1");
    expect(mockDb.product.updateMany).toHaveBeenCalledWith({
      where: { id: "p1", stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
    expect(mockDb.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "u1",
          status: "PAID",
          total: 17980,
          items: {
            create: [
              { productId: "p1", quantity: 2, price: 8990 },
            ],
          },
        }),
      }),
    );
    expect(cookieStore.get(cartCookieName)?.value).toBe("");
  });

  it("devuelve error si no hay sesión", async () => {
    mockAuth.mockResolvedValue(null);
    seedCart([{ id: "p1", qty: 1 }]);
    const result = await placeOrder();
    expect(result.error).toBe(
      "Debes iniciar sesión para confirmar el pedido.",
    );
    expect(mockDb.order.create).not.toHaveBeenCalled();
  });

  it("devuelve error si el carrito está vacío", async () => {
    const result = await placeOrder();
    expect(result.error).toBe("Tu carrito está vacío.");
    expect(mockDb.order.create).not.toHaveBeenCalled();
  });

  it("revierte si no hay stock suficiente", async () => {
    seedCart([{ id: "p1", qty: 2 }]);
    mockDb.product.updateMany.mockResolvedValue({ count: 0 });
    const result = await placeOrder();
    expect(result.error).toBe(
      "No se pudo completar el pedido. Intenta nuevamente.",
    );
    expect(mockDb.order.create).not.toHaveBeenCalled();
    expect(cookieStore.get(cartCookieName)?.value).toBe(
      serializeCart([{ id: "p1", qty: 2 }]),
    );
  });
});
