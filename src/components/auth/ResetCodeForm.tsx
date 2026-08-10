"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verifyResetCodeAction } from "@/app/actions/auth";

const initialState = undefined;

export function ResetCodeForm({ email }: { email: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    verifyResetCodeAction,
    initialState,
  );

  useEffect(() => {
    if (state?.ok && state.changeToken) {
      sessionStorage.setItem("changeToken", state.changeToken);
      router.push("/recuperar/cambiar");
    }
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={email}
          autoComplete="email"
          className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="code" className="text-sm font-medium">
          Código
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          required
          pattern="\d{6}"
          maxLength={6}
          autoComplete="one-time-code"
          className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Verificando…" : "Verificar código"}
      </button>
      <p className="text-sm text-zinc-500">
        <Link href="/recuperar" className="font-medium text-zinc-900 underline">
          Solicitar otro código
        </Link>
      </p>
    </form>
  );
}
