"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => logout())}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:border-zinc-500 disabled:opacity-50"
    >
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
