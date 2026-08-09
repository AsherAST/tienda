import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { CartProvider } from "@/components/cart/CartProvider";
import { getCartDetailed } from "@/lib/cart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tienda Online",
  description: "Tienda online con catálogo, carrito y pedidos",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cart = await getCartDetailed();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider initialCart={cart}>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
