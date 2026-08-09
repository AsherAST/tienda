import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/components/catalog/ProductCard";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return { title: `${product.name} · Tienda`, description: product.description ?? undefined };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          Catálogo
        </Link>{" "}
        / <span className="text-zinc-900">{product.category}</span>
      </nav>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              Sin imagen
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-zinc-400">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-zinc-600">{product.description}</p>
          <div className="mt-6 text-3xl font-bold">{formatPrice(product.price)}</div>
          <p
            className={`mt-2 text-sm ${
              product.stock > 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {product.stock > 0
              ? `${product.stock} unidades en stock`
              : "Agotado"}
          </p>
          <div className="mt-8">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>
    </main>
  );
}
