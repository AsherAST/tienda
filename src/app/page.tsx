import Link from "next/link";
import {
  getProducts,
  getCategories,
  CATALOG_PAGE_SIZE,
} from "@/lib/products";
import {
  parseCatalogParams,
  buildCatalogUrl,
} from "@/lib/catalog-params";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda Online",
  description: "Catálogo de productos",
};

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseCatalogParams(await searchParams);
  const page = query.page ?? 1;
  const [data, categories] = await Promise.all([
    getProducts(query),
    getCategories(),
  ]);
  const { products, total } = data;
  const totalPages = Math.max(Math.ceil(total / CATALOG_PAGE_SIZE), 1);

  const paginationLink = (p: number) =>
    buildCatalogUrl({
      q: query.search,
      categoria: query.category,
      precio: query.maxPrice ? String(query.maxPrice) : undefined,
      orden: query.sort,
      pagina: p > 1 ? String(p) : undefined,
    });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <section className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 p-8 text-white sm:p-12">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Tienda Online
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Catálogo de productos
        </h1>
        <p className="mt-3 max-w-xl text-zinc-300">
          Tecnología para tu día a día. Este es un proyecto de demostración:
          los pedidos son simulados y no se realizan cobros reales.
        </p>
      </section>

      <div className="mt-8">
        <CatalogFilters
          search={query.search}
          category={query.category}
          maxPrice={query.maxPrice}
          sort={query.sort}
          categories={categories}
        />
      </div>

      {products.length > 0 ? (
        <>
          <p className="mt-6 text-sm text-zinc-500">
            {total} producto{total !== 1 ? "s" : ""} disponible
            {total !== 1 ? "s" : ""}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-center gap-4">
              {page > 1 ? (
                <Link
                  href={paginationLink(page - 1)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm transition-colors hover:border-zinc-500"
                >
                  ← Anterior
                </Link>
              ) : null}
              <span className="text-sm text-zinc-500">
                Página {page} de {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={paginationLink(page + 1)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm transition-colors hover:border-zinc-500"
                >
                  Siguiente →
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      ) : (
        <p className="mt-16 text-center text-zinc-500">
          No se encontraron productos con esos filtros.
        </p>
      )}
    </main>
  );
}
