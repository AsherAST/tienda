"use client";

import { useRouter } from "next/navigation";
import { buildCatalogUrl, PRICE_FILTERS } from "@/lib/catalog-params";
import type { ProductSort } from "@/lib/products";

type Props = {
  search?: string;
  category?: string;
  maxPrice?: number;
  sort?: ProductSort;
  categories: string[];
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Más recientes" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
];

export function CatalogFilters({
  search,
  category,
  maxPrice,
  sort,
  categories,
}: Props) {
  const router = useRouter();

  function apply(newValues: Record<string, string>) {
    router.replace(
      buildCatalogUrl({
        q: newValues.q?.trim() || undefined,
        categoria: newValues.categoria || undefined,
        precio: newValues.precio || undefined,
        orden: newValues.orden || undefined,
      }),
      { scroll: false },
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <form
        className="flex flex-1 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          apply({
            q: String(form.get("q") ?? ""),
            categoria: String(form.get("categoria") ?? ""),
            precio: String(form.get("precio") ?? ""),
            orden: String(form.get("orden") ?? ""),
          });
        }}
      >
        <input
          name="q"
          defaultValue={search}
          placeholder="Buscar productos…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
        >
          Buscar
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        <select
          name="categoria"
          defaultValue={category ?? ""}
          onChange={(e) => apply({ categoria: e.target.value, orden: sort ?? "" })}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          name="precio"
          defaultValue={maxPrice ? String(maxPrice) : ""}
          onChange={(e) => apply({ precio: e.target.value, orden: sort ?? "" })}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        >
          {PRICE_FILTERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          name="orden"
          defaultValue={sort ?? ""}
          onChange={(e) => apply({ orden: e.target.value })}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
