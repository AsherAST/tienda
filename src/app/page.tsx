import Image from "next/image";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda Online",
  description: "Catálogo de productos",
};

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function Home() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
      <p className="mt-2 text-zinc-500">
        {products.length} productos disponibles
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="flex flex-col overflow-hidden rounded-xl border border-zinc-200"
          >
            <div className="relative aspect-[4/3] bg-zinc-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <span className="text-xs uppercase tracking-wide text-zinc-400">
                {product.category}
              </span>
              <h2 className="mt-1 font-semibold">{product.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                {product.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">
                  {formatPrice(product.price)}
                </span>
                <span
                  className={`text-sm ${
                    product.stock > 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} en stock`
                    : "Agotado"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
