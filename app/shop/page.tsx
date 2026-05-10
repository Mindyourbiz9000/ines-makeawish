// Page /shop — catalogue éditorial servi depuis Supabase. Les produits créés
// dans les 30 derniers jours apparaissent en section "Nouveauté" en haut.

import StatementBlock from "@/components/shop/StatementBlock";
import PlaceholderProductCard from "@/components/shop/PlaceholderProductCard";
import Colophon from "@/components/shop/Colophon";
import SectionHeader from "@/components/SectionHeader";
import ShopMasthead from "@/components/shop/ShopMasthead";
import Link from "next/link";
import {
  listCatalogProducts,
  isRecentlyCreated,
  type CatalogProduct,
} from "@/lib/shop/catalog-queries";
import { formatPrice } from "@/lib/shop/products";

export const metadata = {
  title: "Boutique · InesPNJ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function ProductGrid({
  products,
  offset = 0,
}: {
  products: CatalogProduct[];
  offset?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 xs:grid-cols-2 sm:grid-cols-3">
      {products.map((p, i) => (
        <PlaceholderProductCard
          key={p.slug}
          slug={p.slug}
          code={p.code}
          name={p.name}
          index={offset + i + 1}
          imageSrc={p.image_src ?? ""}
          priceLabel={formatPrice(p.price_cents)}
        />
      ))}
    </div>
  );
}

export default async function ShopPage() {
  const products = await listCatalogProducts();
  const newcomers = products.filter((p) => isRecentlyCreated(p.created_at));
  const newcomerSlugs = new Set(newcomers.map((p) => p.slug));
  const rest = products.filter((p) => !newcomerSlugs.has(p.slug));

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:pt-10">
      <ShopMasthead />
      <StatementBlock />

      {newcomers.length > 0 ? (
        <section className="mt-16 sm:mt-24">
          <SectionHeader
            eyebrow={`Nouveauté · ${newcomers.length} article${newcomers.length > 1 ? "s" : ""}`}
            title="Fraîchement arrivés"
            className="mb-10"
          />
          <ProductGrid products={newcomers} />
        </section>
      ) : null}

      <section className="mt-16 sm:mt-24">
        <SectionHeader
          eyebrow={`Le catalogue · ${products.length} article${products.length > 1 ? "s" : ""}`}
          title="Le merch"
          className="mb-10"
        />
        {products.length === 0 ? (
          <p className="text-sm text-white/55">
            Le catalogue arrive bientôt.
          </p>
        ) : (
          <ProductGrid products={rest} offset={newcomers.length} />
        )}
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
