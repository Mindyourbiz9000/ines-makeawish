import Link from "next/link";
import ShopMasthead from "@/components/shop/ShopMasthead";
import CheckoutForm from "@/components/shop/CheckoutForm";
import Colophon from "@/components/shop/Colophon";

export const metadata = {
  title: "Paiement · Boutique InesPNJ",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:pt-10">
      <ShopMasthead />

      <header className="mt-12 sm:mt-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          Étape 2 / 2
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.02em] text-white sm:text-5xl">
          Paiement
        </h1>
      </header>

      <CheckoutForm />

      <Colophon />

      <div className="mt-12">
        <Link
          href="/shop/cart"
          className="text-[11px] uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white"
        >
          ← Retour au panier
        </Link>
      </div>
    </main>
  );
}
