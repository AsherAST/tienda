export function Footer() {
  return (
    <footer className="mt-12 border-t border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-center text-sm text-zinc-500 sm:flex-row sm:text-left">
        <p>© {new Date().getFullYear()} Tienda Online · Proyecto de demostración</p>
        <p>Los pagos son simulados, no se realizan cobros reales.</p>
      </div>
    </footer>
  );
}
