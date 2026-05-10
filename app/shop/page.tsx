// Page /shop — catalogue éditorial. Les cartes produits sont cliquables vers
// la page détail (/shop/[slug]). Mockup signals : masthead "Mockup", per-card
// dot+label, colophon en pied de page.

import StatementBlock from "@/components/shop/StatementBlock";
import PlaceholderProductCard from "@/components/shop/PlaceholderProductCard";
import Colophon from "@/components/shop/Colophon";
import SectionHeader from "@/components/SectionHeader";
import ShopMasthead from "@/components/shop/ShopMasthead";
import Link from "next/link";
import { PRODUCTS, formatPrice } from "@/lib/shop/products";

export const metadata = {
  title: "Boutique · InesPNJ",
  robots: { index: false, follow: false },
};

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:pt-10">
      <ShopMasthead />
      <StatementBlock />

      <section className="mt-16 sm:mt-24">
        <SectionHeader
          eyebrow={`Le catalogue · ${PRODUCTS.length} articles`}
          title="Le merch"
          className="mb-10"
        />
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 xs:grid-cols-2 sm:grid-cols-3">
          {PRODUCTS.map((p) => (
            <PlaceholderProductCard
              key={p.slug}
              slug={p.slug}
              code={p.code}
              name={p.name}
              index={p.index}
              imageSrc={p.imageSrc}
              priceLabel={formatPrice(p.priceCents)}
            />
          ))}
        </div>
      </section>

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
