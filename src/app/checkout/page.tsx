import { auth } from "@/auth";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 text-zinc-500">
        Completa tus datos de envío y revisa tu pedido antes de confirmar.
      </p>
      <div className="mt-8">
        <CheckoutView userName={session?.user?.name ?? undefined} />
      </div>
    </main>
  );
}
