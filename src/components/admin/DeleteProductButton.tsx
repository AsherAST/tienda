"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct } from "@/app/actions/products";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function remove() {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    setPending(true);
    setError(undefined);
    const result = await deleteProduct(productId);
    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className="text-sm text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-50"
      >
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
