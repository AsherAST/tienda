import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export type ProductSort = "recent" | "price-asc" | "price-desc";

export type ProductQuery = {
  search?: string;
  category?: string;
  maxPrice?: number;
  sort?: ProductSort;
};

export async function getProducts(query: ProductQuery = {}) {
  const where: Prisma.ProductWhereInput = {
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.maxPrice ? { price: { lte: query.maxPrice } } : {}),
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "asc" };
  if (query.sort === "price-asc") orderBy = { price: "asc" };
  if (query.sort === "price-desc") orderBy = { price: "desc" };
  if (query.sort === "recent") orderBy = { createdAt: "desc" };

  return db.product.findMany({ where, orderBy });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({ where: { slug } });
}

export async function getCategories() {
  const rows = await db.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}
