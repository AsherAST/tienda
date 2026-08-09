import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-24 text-center">
      <p className="text-6xl font-bold tracking-tight text-zinc-900">404</p>
      <h1 className="mt-4 text-2xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-zinc-500">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
      >
        Volver al catálogo
      </Link>
    </main>
  );
}
