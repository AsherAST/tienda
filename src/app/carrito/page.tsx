import { CartView } from "@/components/cart/CartView";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Tu carrito</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </main>
  );
}
