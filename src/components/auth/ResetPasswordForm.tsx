"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { resetPassword } from "@/app/actions/auth";

const initialState = undefined;

function subscribe() {
  return () => {};
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(resetPassword, initialState);

  const changeToken = useSyncExternalStore(
    subscribe,
    () => sessionStorage.getItem("changeToken") ?? "",
    () => "",
  );

  useEffect(() => {
    if (state?.ok) {
      sessionStorage.removeItem("changeToken");
      router.push("/login");
    }
  }, [state, router]);

  return (
    <div className="flex flex-col gap-4">
      {!changeToken ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          No hay un código verificado. Solicita un nuevo código de recuperación.
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="changeToken" value={changeToken} />
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              Nueva contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </form>
      )}
      <p className="text-sm text-zinc-500">
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
