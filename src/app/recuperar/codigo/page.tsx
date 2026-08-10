import Link from "next/link";
import { ResetCodeForm } from "@/components/auth/ResetCodeForm";

export default async function ResetCodePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">
        Código de recuperación
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Escribe el código de 6 dígitos que enviamos a tu correo.
      </p>
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
        <ResetCodeForm email={email ?? ""} />
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </main>
  );
}
