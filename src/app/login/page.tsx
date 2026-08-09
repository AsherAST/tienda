import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Accede a tu cuenta para hacer pedidos.
      </p>
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
        <LoginForm />
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-zinc-900 underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
