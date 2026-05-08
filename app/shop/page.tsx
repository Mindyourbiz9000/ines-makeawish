// Page /shop — redesign Sarg : éditorial minimal, supermoderne. Aucun lien
// depuis la home, accessible uniquement par URL directe. Trois signaux
// "mockup" distribués (masthead, par carte, colophon) plutôt qu'un gros
// bandeau "construction".

import Link from "next/link";
import StatementBlock from "@/components/shop/StatementBlock";
import PlaceholderProductCard from "@/components/shop/PlaceholderProductCard";
import Colophon from "@/components/shop/Colophon";
import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "Boutique · InesPNJ (preview)",
  // Pas indexer la page mockup chez Google
  robots: { index: false, follow: false },
};

const PRODUCTS = [
  { code: "T-shirt", name: "SLAY", index: 1, imageSrc: "/shop/placeholder/tshirt-slay.png" },
  { code: "Sweat", name: "SLAY", index: 2, imageSrc: "/shop/placeholder/sweat-slay.png" },
  { code: "Hoodie", name: "SLAY", index: 3, imageSrc: "/shop/placeholder/hoodie-slay.png" },
  { code: "Casquette", name: "SLAY", index: 4, imageSrc: "/shop/placeholder/cap-slay.png" },
  { code: "Mug", name: "SLAY", index: 5, imageSrc: "/shop/placeholder/mug-slay.png" },
  { code: "Stickers", name: "SLAY", index: 6, imageSrc: "/shop/placeholder/stickers-slay.png" },
];

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:pt-10">
      {/* Masthead : signal mockup #1 (dot rose pulsant + "Preview · N°01") */}
      <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/45">
        <Link
          href="/"
          className="transition-colors hover:text-white"
        >
          ← InesPNJ
        </Link>
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-pink"
          />
          <span>Boutique · Aperçu</span>
        </div>
      </nav>

      <StatementBlock />

      <section className="mt-16 sm:mt-24">
        <SectionHeader
          eyebrow="Le catalogue · 6 articles"
          title="Le merch"
          className="mb-10"
        />
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 xs:grid-cols-2 sm:grid-cols-3">
          {PRODUCTS.map((p) => (
            <PlaceholderProductCard key={p.code} {...p} />
          ))}
        </div>
      </section>

      {/* Signal mockup #3 : fine print colophon */}
      <Colophon />

      <div className="mt-12">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white"
        >
          ← Retour à InesPNJ
        </Link>
      </div>
    </main>
  );
}
