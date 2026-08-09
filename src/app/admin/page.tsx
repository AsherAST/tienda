import Link from "next/link";
import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Panel de administración</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Bienvenido, {session?.user?.name}. Aquí podrás gestionar la tienda.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/productos"
          className="rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400"
        >
          <h2 className="font-semibold">Productos</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Crear, editar y eliminar productos (próximamente).
          </p>
        </Link>
        <Link
          href="/admin/pedidos"
          className="rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400"
        >
          <h2 className="font-semibold">Pedidos</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Gestionar pedidos de los clientes (próximamente).
          </p>
        </Link>
      </div>
    </main>
  );
}
