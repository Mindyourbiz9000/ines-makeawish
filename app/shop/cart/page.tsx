import Link from "next/link";
import ShopMasthead from "@/components/shop/ShopMasthead";
import CartContent from "@/components/shop/CartContent";
import Colophon from "@/components/shop/Colophon";

export const metadata = {
  title: "Panier · Boutique InesPNJ",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:pt-10">
      <ShopMasthead />

      <header className="mt-12 sm:mt-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          Étape 1 / 2
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.02em] text-white sm:text-5xl">
          Ton panier
        </h1>
      </header>

      <CartContent />

      <Colophon />

      <div className="mt-12">
        <Link
          href="/shop"
          className="text-[11px] uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white"
        >
          ← Retour au catalogue
        </Link>
      </div>
    </main>
  );
}
