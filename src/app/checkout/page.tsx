import { CheckoutView } from "@/components/checkout/CheckoutView";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 text-zinc-500">
        Revisa tu pedido antes de confirmar la compra.
      </p>
      <div className="mt-8">
        <CheckoutView />
      </div>
    </main>
  );
}
