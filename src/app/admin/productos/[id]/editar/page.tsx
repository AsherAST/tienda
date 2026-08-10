import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/app/actions/products";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await auth();

  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-12">
      <Link
        href="/admin/productos"
        className="text-sm text-zinc-500 hover:underline"
      >
        ← Volver a productos
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Editar producto
      </h1>
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <ProductForm
          initial={{
            name: product.name,
            slug: product.slug,
            description: product.description ?? "",
            price: String(product.price),
            stock: String(product.stock),
            category: product.category,
          }}
          currentImageUrl={product.imageUrl}
          action={(formData) => updateProduct(id, formData)}
          submitLabel="Guardar cambios"
        />
      </div>
    </main>
  );
}
