import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">
        Recuperar contraseña
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Escribe tu correo y te enviaremos un enlace para restablecer tu
        contraseña.
      </p>
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </main>
  );
}
