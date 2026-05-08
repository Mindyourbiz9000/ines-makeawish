// PDP — page détail produit. Server component qui lit le catalogue mockup,
// délègue les contrôles (taille / qty / add to cart) à un client component.

import { notFound } from "next/navigation";
import Link from "next/link";
import ShopMasthead from "@/components/shop/ShopMasthead";
import ProductImage from "@/components/shop/ProductImage";
import AddToCartControls from "@/components/shop/AddToCartControls";
import Colophon from "@/components/shop/Colophon";
import { PRODUCTS, getProductBySlug, formatPrice } from "@/lib/shop/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: `${product.code} · ${product.name} — Boutique InesPNJ (preview)`,
    robots: { index: false, follow: false },
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:pt-10">
      <ShopMasthead />

      <section className="mt-10 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-[1.2fr_1fr] md:gap-12">
        {/* Image */}
        <ProductImage
          imageSrc={product.imageSrc}
          alt={`${product.code} · ${product.name}`}
          index={product.index}
        />

        {/* Infos */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">
              {product.code}
            </p>
            <h1 className="mt-3 text-4xl font-medium tracking-[-0.02em] text-white sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-medium tabular-nums text-white sm:text-3xl">
              {formatPrice(product.priceCents)}
            </p>
          </div>

          <div className="border-t border-white/[0.08] pt-5">
            <p className="text-[15px] leading-relaxed text-white/70">
              {product.description}
            </p>
          </div>

          <AddToCartControls product={product} />
        </div>
      </section>

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
