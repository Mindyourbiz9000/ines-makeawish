import type { ReactNode } from "react";
import Link from "next/link";

// Layout dédié pour /shop/admin. Évite que les pages admin soient enveloppées
// dans le CartProvider du shop public (pas besoin de cart, et en plus on sort
// du contexte visiteur). Pas d'auth — accessible à qui connaît l'URL.

export const metadata = {
  title: "Admin · Boutique InesPNJ",
  robots: { index: false, follow: false },
};

const TABS = [
  { href: "/shop/admin", label: "Vue d'ensemble", exact: true },
  { href: "/shop/admin/products", label: "Produits" },
  { href: "/shop/admin/orders", label: "Commandes" },
  { href: "/shop/admin/deliveries", label: "Livraisons" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-24 pt-6 sm:pt-10">
      <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/45">
        <Link href="/shop" className="transition-colors hover:text-white">
          ← Boutique
        </Link>
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"
          />
          <span>Admin</span>
        </div>
      </nav>

      <header className="mt-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          Backoffice · privé
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.02em] text-white sm:text-5xl">
          Boutique
        </h1>
      </header>

      <div className="mt-8 flex flex-wrap gap-1 border-b border-white/[0.08]">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="min-h-[44px] rounded-t-md px-4 py-2 text-[12px] uppercase tracking-[0.22em] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-8">{children}</div>
    </main>
  );
}
