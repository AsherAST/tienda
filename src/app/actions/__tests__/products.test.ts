import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockDb, mockAuth } = vi.hoisted(() => ({
  mockDb: {
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  mockAuth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: mockDb }));
vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { Prisma } from "@/generated/prisma/client";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/actions/products";

const validInput = {
  name: "Monitor 27\"",
  price: 159990,
  stock: 10,
  category: "Monitores",
};

function uniqueError() {
  return new Prisma.PrismaClientKnownRequestError("unique failed", {
    code: "P2002",
    clientVersion: "test",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } });
});

describe("createProduct", () => {
  it("rechaza a un usuario que no es admin", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "CUSTOMER" } });
    const result = await createProduct(validInput);
    expect(result.error).toBe("No autorizado.");
    expect(mockDb.product.create).not.toHaveBeenCalled();
  });

  it("valida la entrada", async () => {
    const result = await createProduct({ ...validInput, price: -5 });
    expect(result.error).toBeDefined();
    expect(mockDb.product.create).not.toHaveBeenCalled();
  });

  it("crea el producto generando el slug", async () => {
    mockDb.product.create.mockResolvedValue({ id: "p1" });
    const result = await createProduct(validInput);
    expect(result.ok).toBe(true);
    expect(mockDb.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Monitor 27"',
        slug: "monitor-27",
        price: 159990,
        stock: 10,
        category: "Monitores",
        description: null,
        imageUrl: null,
      }),
    });
  });

  it("devuelve error si el slug ya existe", async () => {
    mockDb.product.create.mockRejectedValue(uniqueError());
    const result = await createProduct(validInput);
    expect(result.error).toBe("Ya existe un producto con ese slug.");
  });
});

describe("updateProduct", () => {
  it("devuelve error si el producto no existe", async () => {
    mockDb.product.findUnique.mockResolvedValue(null);
    const result = await updateProduct("p1", validInput);
    expect(result.error).toBe("Producto no encontrado.");
  });

  it("actualiza el producto", async () => {
    mockDb.product.findUnique.mockResolvedValue({ id: "p1" });
    mockDb.product.update.mockResolvedValue({ id: "p1" });
    const result = await updateProduct("p1", {
      ...validInput,
      name: "Monitor Nuevo",
      stock: 3,
    });
    expect(result.ok).toBe(true);
    expect(mockDb.product.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: expect.objectContaining({
        name: "Monitor Nuevo",
        slug: "monitor-nuevo",
        stock: 3,
      }),
    });
  });
});

describe("deleteProduct", () => {
  it("devuelve error si el producto no existe", async () => {
    mockDb.product.findUnique.mockResolvedValue(null);
    const result = await deleteProduct("p1");
    expect(result.error).toBe("Producto no encontrado.");
  });

  it("elimina el producto", async () => {
    mockDb.product.findUnique.mockResolvedValue({ id: "p1" });
    mockDb.product.delete.mockResolvedValue({ id: "p1" });
    const result = await deleteProduct("p1");
    expect(result.ok).toBe(true);
    expect(mockDb.product.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });
});
