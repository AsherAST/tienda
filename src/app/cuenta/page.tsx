import { auth } from "@/auth";

export default async function CuentaPage() {
  const session = await auth();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Mi cuenta</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Resumen de tu cuenta de usuario.
      </p>
      <dl className="mt-8 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        <div className="flex justify-between px-4 py-3">
          <dt className="text-sm text-zinc-500">Nombre</dt>
          <dd className="text-sm font-medium">{session?.user?.name}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-sm text-zinc-500">Correo</dt>
          <dd className="text-sm font-medium">{session?.user?.email}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-sm text-zinc-500">Rol</dt>
          <dd className="text-sm font-medium">
            {session?.user?.role === "ADMIN" ? "Administrador" : "Cliente"}
          </dd>
        </div>
      </dl>
    </main>
  );
}
