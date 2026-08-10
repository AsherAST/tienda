"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { productSchema, slugify } from "@/lib/validators";

export type ProductActionResult = { ok?: boolean; error?: string };

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

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

function isBlobUrl(url: string | null | undefined): url is string {
  return !!url && url.includes(".public.blob.vercel-storage.com");
}

function toData(
  parsed: {
    name: string;
    slug?: string;
    description?: string;
    price: number;
    stock: number;
    category: string;
  },
  imageUrl: string | null,
) {
  return {
    name: parsed.name,
    slug: parsed.slug || slugify(parsed.name),
    description: parsed.description || null,
    price: parsed.price,
    stock: parsed.stock,
    category: parsed.category,
    imageUrl,
  };
}

function parseFields(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    category: formData.get("category"),
  });
}

async function uploadImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("image");
  const isFile =
    file !== null && typeof file === "object" && "size" in file;
  if (!isFile || (file as File).size === 0) return {};

  const image = file as File;
  if (!image.type.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen." };
  }
  if (image.size > MAX_IMAGE_SIZE) {
    return { error: "La imagen debe pesar menos de 4 MB." };
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "El almacenamiento de imágenes no está configurado." };
  }

  const safeName = image.name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
  const blob = await put(
    `products/${crypto.randomUUID()}-${safeName}`,
    image,
    { access: "public" },
  );
  return { url: blob.url };
}

export async function createProduct(
  formData: FormData,
): Promise<ProductActionResult> {
  if (!(await isAdmin())) return { error: "No autorizado." };

  const parsed = parseFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const image = await uploadImage(formData);
  if (image.error) return { error: image.error };

  try {
    await db.product.create({ data: toData(parsed.data, image.url ?? null) });
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
  formData: FormData,
): Promise<ProductActionResult> {
  if (!(await isAdmin())) return { error: "No autorizado." };

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { error: "Producto no encontrado." };

  const parsed = parseFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const image = await uploadImage(formData);
  if (image.error) return { error: image.error };

  let imageUrl = existing.imageUrl;
  if (image.url) {
    imageUrl = image.url;
    if (isBlobUrl(existing.imageUrl)) {
      await del(existing.imageUrl).catch(() => {});
    }
  } else if (formData.get("removeImage") === "on") {
    if (isBlobUrl(existing.imageUrl)) {
      await del(existing.imageUrl).catch(() => {});
    }
    imageUrl = null;
  }

  try {
    await db.product.update({
      where: { id },
      data: toData(parsed.data, imageUrl),
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

  if (isBlobUrl(existing.imageUrl)) {
    await del(existing.imageUrl).catch(() => {});
  }

  try {
    await db.product.delete({ where: { id } });
  } catch {
    return { error: "No se pudo eliminar el producto (puede estar en un pedido)." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true };
}
