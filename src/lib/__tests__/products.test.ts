import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockDb } = vi.hoisted(() => {
  return {
    mockDb: {
      product: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/db", () => ({ db: mockDb }));

import { getProducts, getProductBySlug, getCategories } from "@/lib/products";

describe("getProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.product.findMany.mockResolvedValue([]);
    mockDb.product.count.mockResolvedValue(0);
  });

  it("construye where con búsqueda, categoría y precio máximo", async () => {
    await getProducts({ search: "teclado", category: "Periféricos", maxPrice: 10000 });
    expect(mockDb.product.findMany).toHaveBeenCalledWith({
      where: {
        name: { contains: "teclado", mode: "insensitive" },
        category: "Periféricos",
        price: { lte: 10000 },
      },
      orderBy: { createdAt: "asc" },
      skip: 0,
      take: 12,
    });
  });

  it("aplica orden por precio", async () => {
    await getProducts({ sort: "price-desc" });
    expect(mockDb.product.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { price: "desc" },
      skip: 0,
      take: 12,
    });
  });

  it("paginiza desde la página indicada", async () => {
    mockDb.product.findMany.mockResolvedValue([{ id: "p1" }]);
    mockDb.product.count.mockResolvedValue(25);
    const result = await getProducts({ page: 3 });
    expect(mockDb.product.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "asc" },
      skip: 24,
      take: 12,
    });
    expect(result).toEqual({ products: [{ id: "p1" }], total: 25 });
  });
});

describe("getProductBySlug", () => {
  it("busca por slug", async () => {
    mockDb.product.findUnique.mockResolvedValue({ id: "p1" });
    const result = await getProductBySlug("teclado-mecanico-rgb");
    expect(result).toEqual({ id: "p1" });
    expect(mockDb.product.findUnique).toHaveBeenCalledWith({
      where: { slug: "teclado-mecanico-rgb" },
    });
  });
});

describe("getCategories", () => {
  it("retorna categorías únicas ordenadas", async () => {
    mockDb.product.findMany.mockResolvedValue([
      { category: "Audio" },
      { category: "Periféricos" },
    ]);
    const result = await getCategories();
    expect(result).toEqual(["Audio", "Periféricos"]);
    expect(mockDb.product.findMany).toHaveBeenCalledWith({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
  });
});
