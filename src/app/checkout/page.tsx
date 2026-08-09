import Link from "next/link";

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-3 rounded-xl border border-zinc-200 p-6 text-sm text-zinc-600">
        El pago estará disponible en la próxima etapa del proyecto.
      </p>
      <Link
        href="/carrito"
        className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm text-white hover:bg-zinc-700"
      >
        Volver al carrito
      </Link>
    </main>
  );
}
