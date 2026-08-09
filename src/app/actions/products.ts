"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { productSchema, slugify } from "@/lib/validators";

export type ProductActionResult = { ok?: boolean; error?: string };

async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function toData(parsed: {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}) {
  return {
    name: parsed.name,
    slug: parsed.slug || slugify(parsed.name),
    description: parsed.description || null,
    price: parsed.price,
    stock: parsed.stock,
    category: parsed.category,
    imageUrl: parsed.imageUrl || null,
  };
}

export async function createProduct(
  input: unknown,
): Promise<ProductActionResult> {
  if (!(await isAdmin())) return { error: "No autorizado." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await db.product.create({ data: toData(parsed.data) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "Ya existe un producto con ese slug." };
    }
    return { error: "No se pudo crear el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true };
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<ProductActionResult> {
  if (!(await isAdmin())) return { error: "No autorizado." };

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { error: "Producto no encontrado." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await db.product.update({
      where: { id },
      data: toData(parsed.data),
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "Ya existe un producto con ese slug." };
    }
    return { error: "No se pudo actualizar el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  if (!(await isAdmin())) return { error: "No autorizado." };

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { error: "Producto no encontrado." };

  try {
    await db.product.delete({ where: { id } });
  } catch {
    return { error: "No se pudo eliminar el producto (puede estar en un pedido)." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true };
}
