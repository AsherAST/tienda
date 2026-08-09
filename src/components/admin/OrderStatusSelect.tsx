"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import { OrderStatus } from "@/generated/prisma/enums";

export function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function change(next: string) {
    setPending(true);
    setError(undefined);
    setValue(next);
    const result = await updateOrderStatus(orderId, next);
    if (result.error) {
      setError(result.error);
      setValue(current);
    }
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        className="rounded-lg border border-zinc-300 px-2 py-1 text-sm disabled:opacity-50"
      >
        {Object.values(OrderStatus).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {pending ? <span className="text-xs text-zinc-400">…</span> : null}
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : null}
    </div>
  );
}
