// Page /shop — Phase 0 mockup. Pas de lien depuis la home, accessible uniquement
// par URL directe. 6 produits factices avec branding "SLAY", clairement marqués
// comme aperçu (3 endroits différents : hero banner, badge sur chaque carte,
// disclaimer footer).

import Link from "next/link";
import UnderConstructionBanner from "@/components/shop/UnderConstructionBanner";
import PlaceholderProductCard from "@/components/shop/PlaceholderProductCard";
import MockupDisclaimer from "@/components/shop/MockupDisclaimer";

export const metadata = {
  title: "Boutique · InesPNJ (mockup)",
  // robots: noindex pour éviter que Google indexe la page mockup
  robots: { index: false, follow: false },
};

const PLACEHOLDER_PRODUCTS = [
  {
    title: "T-shirt SLAY",
    image: "/shop/placeholder/tshirt-slay.png",
    fallbackEmoji: "👕",
  },
  {
    title: "Sweat SLAY",
    image: "/shop/placeholder/sweat-slay.png",
    fallbackEmoji: "🧥",
  },
  {
    title: "Hoodie SLAY",
    image: "/shop/placeholder/hoodie-slay.png",
    fallbackEmoji: "🧣",
  },
  {
    title: "Casquette SLAY",
    image: "/shop/placeholder/cap-slay.png",
    fallbackEmoji: "🧢",
  },
  {
    title: "Mug SLAY",
    image: "/shop/placeholder/mug-slay.png",
    fallbackEmoji: "☕",
  },
  {
    title: "Stickers SLAY",
    image: "/shop/placeholder/stickers-slay.png",
    fallbackEmoji: "✨",
  },
];

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-white/55 transition-colors hover:text-white"
      >
        ← Retour à la home
      </Link>

      <div className="mt-6">
        <UnderConstructionBanner />
      </div>

      <section className="mt-12">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Le merch SLAY
          </h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-neon-pink/80 sm:text-[11px]">
            Aperçu · Mockup
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PLACEHOLDER_PRODUCTS.map((p) => (
            <PlaceholderProductCard key={p.title} {...p} />
          ))}
        </div>
      </section>

      <MockupDisclaimer />

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
        >
          ← Retour à InesPNJ
        </Link>
      </div>
    </main>
  );
}
