import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  await auth();

  const products = await db.product.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Crea, edita y elimina productos de la tienda.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
        >
          Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-zinc-500">No hay productos aún.</p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/producto/${product.slug}`}
                  className="block truncate font-medium hover:underline"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-zinc-500">
                  {product.category} · {formatPrice(product.price)} ·{" "}
                  <span
                    className={
                      product.stock > 0 ? "text-emerald-600" : "text-red-600"
                    }
                  >
                    {product.stock} en stock
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/productos/${product.id}/editar`}
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  Editar
                </Link>
                <DeleteProductButton productId={product.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
