import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { CartBadge } from "@/components/cart/CartBadge";

export async function Navbar() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Tienda
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <CartBadge />
          {session?.user ? (
            <>
              <Link href="/cuenta" className="hover:underline">
                {session.user.name}
              </Link>
              <Link href="/pedidos" className="hover:underline">
                Mis pedidos
              </Link>
              {isAdmin && (
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white transition-colors hover:bg-zinc-700"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
