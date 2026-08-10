"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/app/actions/auth";

const initialState = undefined;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  useEffect(() => {
    if (state?.ok && state.email) {
      router.push(`/recuperar/codigo?email=${encodeURIComponent(state.email)}`);
    }
  }, [state, router]);

  return (
    <div className="flex flex-col gap-4">
      {state?.ok && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Revisa tu correo electrónico. Recibirás un código de 6 dígitos para
          restablecer tu contraseña.
        </p>
      )}
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <form action={action} className="flex flex-col gap-4">
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
          {pending ? "Enviando…" : "Enviar código de recuperación"}
        </button>
      </form>
    </div>
  );
}
