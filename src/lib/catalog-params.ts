import { z } from "zod";
import type { ProductQuery, ProductSort } from "@/lib/products";

const catalogParamsSchema = z.object({
  q: z.string().trim().max(80).optional(),
  categoria: z.string().trim().max(50).optional(),
  precio: z.string().trim().max(10).optional(),
  orden: z.enum(["recent", "price-asc", "price-desc"]).optional(),
});

const SORTS: Record<string, ProductSort> = {
  recent: "recent",
  "price-asc": "price-asc",
  "price-desc": "price-desc",
};

export function parseCatalogParams(
  searchParams: Record<string, string | string[] | undefined>,
): ProductQuery {
  const raw = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const parsed = catalogParamsSchema.safeParse(raw);
  if (!parsed.success) return {};

  const { q, categoria, precio, orden } = parsed.data;
  const maxPrice = precio ? Number.parseInt(precio, 10) : undefined;

  return {
    search: q || undefined,
    category: categoria || undefined,
    maxPrice: maxPrice && Number.isFinite(maxPrice) ? maxPrice : undefined,
    sort: orden ? SORTS[orden] : undefined,
  };
}

export function buildCatalogUrl(params: Record<string, string | undefined>) {
  const url = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) url.set(key, value);
  }
  const qs = url.toString();
  return qs ? `/?${qs}` : "/";
}

export const PRICE_FILTERS = [
  { value: "", label: "Todos los precios" },
  { value: "10000", label: "Hasta $10.000" },
  { value: "50000", label: "Hasta $50.000" },
  { value: "150000", label: "Hasta $150.000" },
  { value: "250000", label: "Hasta $250.000" },
];
