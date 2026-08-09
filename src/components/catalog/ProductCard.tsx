import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            Sin imagen
          </div>
        )}
        {product.stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-white">
            Agotado
          </span>
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
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          <span
            className={`text-sm ${
              product.stock > 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
          </span>
        </div>
      </div>
    </Link>
  );
}
