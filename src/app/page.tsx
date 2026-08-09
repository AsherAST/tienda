import { getProducts, getCategories } from "@/lib/products";
import { parseCatalogParams } from "@/lib/catalog-params";
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
  const [products, categories] = await Promise.all([
    getProducts(query),
    getCategories(),
  ]);

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
            {products.length} producto{products.length !== 1 ? "s" : ""}{" "}
            disponible{products.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-16 text-center text-zinc-500">
          No se encontraron productos con esos filtros.
        </p>
      )}
    </main>
  );
}
