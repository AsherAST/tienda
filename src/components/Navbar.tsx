import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { CartBadge } from "@/components/cart/CartBadge";
import { MobileMenu } from "@/components/MobileMenu";
import type { NavItem } from "@/components/MobileMenu";

export async function Navbar() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const items: NavItem[] = session?.user
    ? [
        { href: "/cuenta", label: session.user.name ?? "Mi cuenta" },
        { href: "/pedidos", label: "Mis pedidos" },
        ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [
        { href: "/login", label: "Iniciar sesión" },
        { href: "/registro", label: "Registrarse", primary: true },
      ];

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
          Tienda
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <CartBadge />

          <nav className="hidden items-center gap-4 text-sm md:flex">
            {session?.user ? (
              <>
                <Link href="/cuenta" className="whitespace-nowrap hover:underline">
                  {session.user.name}
                </Link>
                <Link href="/pedidos" className="whitespace-nowrap hover:underline">
                  Mis pedidos
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="whitespace-nowrap hover:underline">
                    Admin
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="whitespace-nowrap hover:underline">
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-white transition-colors hover:bg-zinc-700"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>

          <MobileMenu items={items} />
        </div>
      </div>
    </header>
  );
}
