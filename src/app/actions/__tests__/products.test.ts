import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockDb, mockAuth, mockPut, mockDel } = vi.hoisted(() => ({
  mockDb: {
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  mockAuth: vi.fn(),
  mockPut: vi.fn(),
  mockDel: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: mockDb }));
vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("@vercel/blob", () => ({ put: mockPut, del: mockDel }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { Prisma } from "@/generated/prisma/client";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/actions/products";

const BLOB_URL =
  "https://store.public.blob.vercel-storage.com/products/abc.png";

function toFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set("name", overrides.name ?? 'Monitor 27"');
  fd.set("slug", overrides.slug ?? "");
  fd.set("description", overrides.description ?? "");
  fd.set("price", overrides.price ?? "159990");
  fd.set("stock", overrides.stock ?? "10");
  fd.set("category", overrides.category ?? "Monitores");
  return fd;
}

function toFormDataWithImage(filename = "foto.png", type = "image/png") {
  const fd = toFormData();
  fd.set("image", new File(["datos"], filename, { type }));
  return fd;
}

function uniqueError() {
  return new Prisma.PrismaClientKnownRequestError("unique failed", {
    code: "P2002",
    clientVersion: "test",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } });
  mockPut.mockResolvedValue({ url: BLOB_URL });
  mockDel.mockResolvedValue(undefined);
  process.env.BLOB_READ_WRITE_TOKEN = "test-token";
});

describe("createProduct", () => {
  it("rechaza a un usuario que no es admin", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "CUSTOMER" } });
    const result = await createProduct(toFormData());
    expect(result.error).toBe("No autorizado.");
    expect(mockDb.product.create).not.toHaveBeenCalled();
  });

  it("valida la entrada", async () => {
    const fd = toFormData({ price: "-5" });
    const result = await createProduct(fd);
    expect(result.error).toBeDefined();
    expect(mockDb.product.create).not.toHaveBeenCalled();
  });

  it("crea el producto sin imagen generando el slug", async () => {
    mockDb.product.create.mockResolvedValue({ id: "p1" });
    const result = await createProduct(toFormData());
    expect(result.ok).toBe(true);
    expect(mockPut).not.toHaveBeenCalled();
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

  it("sube la imagen y guarda la URL", async () => {
    mockDb.product.create.mockResolvedValue({ id: "p1" });
    const result = await createProduct(toFormDataWithImage());
    expect(result.ok).toBe(true);
    expect(mockPut).toHaveBeenCalledTimes(1);
    const [pathname, file] = mockPut.mock.calls[0];
    expect(pathname).toMatch(/^products\/.+\.png$/);
    expect(file).toBeInstanceOf(File);
    expect(mockDb.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ imageUrl: BLOB_URL }),
    });
  });

  it("rechaza un archivo que no es imagen", async () => {
    const result = await createProduct(
      toFormDataWithImage("doc.txt", "text/plain"),
    );
    expect(result.error).toBe("El archivo debe ser una imagen.");
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("devuelve error si el slug ya existe", async () => {
    mockDb.product.create.mockRejectedValue(uniqueError());
    const result = await createProduct(toFormData());
    expect(result.error).toBe("Ya existe un producto con ese slug.");
  });
});

describe("updateProduct", () => {
  it("devuelve error si el producto no existe", async () => {
    mockDb.product.findUnique.mockResolvedValue(null);
    const result = await updateProduct("p1", toFormData());
    expect(result.error).toBe("Producto no encontrado.");
  });

  it("mantiene la imagen si no sube archivo ni quita", async () => {
    mockDb.product.findUnique.mockResolvedValue({
      id: "p1",
      imageUrl: BLOB_URL,
    });
    mockDb.product.update.mockResolvedValue({ id: "p1" });
    const result = await updateProduct("p1", toFormData());
    expect(result.ok).toBe(true);
    expect(mockDb.product.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: expect.objectContaining({ imageUrl: BLOB_URL }),
    });
  });

  it("reemplaza la imagen y borra la anterior", async () => {
    mockDb.product.findUnique.mockResolvedValue({
      id: "p1",
      imageUrl: BLOB_URL,
    });
    mockDb.product.update.mockResolvedValue({ id: "p1" });
    const result = await updateProduct("p1", toFormDataWithImage());
    expect(result.ok).toBe(true);
    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(mockDel).toHaveBeenCalledWith(BLOB_URL);
    expect(mockDb.product.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: expect.objectContaining({ imageUrl: BLOB_URL }),
    });
  });

  it("quita la imagen si se marca removeImage", async () => {
    mockDb.product.findUnique.mockResolvedValue({
      id: "p1",
      imageUrl: BLOB_URL,
    });
    mockDb.product.update.mockResolvedValue({ id: "p1" });
    const fd = toFormData();
    fd.set("removeImage", "on");
    const result = await updateProduct("p1", fd);
    expect(result.ok).toBe(true);
    expect(mockDel).toHaveBeenCalledWith(BLOB_URL);
    expect(mockDb.product.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: expect.objectContaining({ imageUrl: null }),
    });
  });
});

describe("deleteProduct", () => {
  it("devuelve error si el producto no existe", async () => {
    mockDb.product.findUnique.mockResolvedValue(null);
    const result = await deleteProduct("p1");
    expect(result.error).toBe("Producto no encontrado.");
  });

  it("elimina el producto y su imagen del blob", async () => {
    mockDb.product.findUnique.mockResolvedValue({
      id: "p1",
      imageUrl: BLOB_URL,
    });
    mockDb.product.delete.mockResolvedValue({ id: "p1" });
    const result = await deleteProduct("p1");
    expect(result.ok).toBe(true);
    expect(mockDel).toHaveBeenCalledWith(BLOB_URL);
    expect(mockDb.product.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });
});
