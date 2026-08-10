"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

const initialState = undefined;

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state?.resetUrl) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Este es tu enlace de recuperación (válido por 1 hora):
        </p>
        <Link
          href={state.resetUrl}
          className="break-all rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-zinc-700"
        >
          {state.resetUrl}
        </Link>
      </div>
    );
  }

  if (state?.ok) {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        Si existe una cuenta con ese correo, este es tu enlace de recuperación.
      </p>
    );
  }

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
          autoComplete="email"
          className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>
    </form>
  );
}
