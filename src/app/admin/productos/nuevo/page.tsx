import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/app/actions/products";

export const dynamic = "force-dynamic";

export default function NuevoProductoPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-12">
      <Link
        href="/admin/productos"
        className="text-sm text-zinc-500 hover:underline"
      >
        ← Volver a productos
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Nuevo producto
      </h1>
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <ProductForm action={createProduct} submitLabel="Crear producto" />
      </div>
    </main>
  );
}
