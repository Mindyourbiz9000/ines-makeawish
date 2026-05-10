// Lectures publiques du catalogue boutique. Server-side uniquement (utilise
// createServerClient avec la secret key, donc bypass RLS — équivalent ici à
// lire le subset actif via la policy publique de toute façon).
//
// Pour le mockup, on lit tout côté server à chaque request (force-dynamic
// sur /shop et /shop/[slug]). À cacher / ISR plus tard si besoin.

import { createServerClient } from "@/lib/supabase/server";

export type CatalogProduct = {
  slug: string;
  code: string;
  name: string;
  description: string | null;
  image_src: string | null;
  price_cents: number;
  sort_order: number;
  created_at: string;
  sizes: string[];
};

function mapVariants(
  variants:
    | { product_id: number; size: string; active: boolean; stock: number }[]
    | null,
  productId: number
): string[] {
  if (!variants) return [];
  return variants
    .filter((v) => v.product_id === productId && v.active)
    .map((v) => v.size);
}

export async function listCatalogProducts(): Promise<CatalogProduct[]> {
  const supabase = createServerClient();
  const { data: products } = await supabase
    .from("shop_products")
    .select(
      "id, slug, code, name, description, image_src, price_cents, sort_order, created_at"
    )
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (!products || products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const { data: variants } = await supabase
    .from("shop_product_variants")
    .select("product_id, size, active, stock")
    .in("product_id", ids);
  return products.map((p) => ({
    slug: p.slug,
    code: p.code,
    name: p.name,
    description: p.description,
    image_src: p.image_src,
    price_cents: p.price_cents,
    sort_order: p.sort_order,
    created_at: p.created_at,
    sizes: mapVariants(variants ?? null, p.id),
  }));
}

export async function getCatalogProductBySlug(
  slug: string
): Promise<CatalogProduct | null> {
  const supabase = createServerClient();
  const { data: product } = await supabase
    .from("shop_products")
    .select(
      "id, slug, code, name, description, image_src, price_cents, sort_order, created_at, active"
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!product || !product.active) return null;
  const { data: variants } = await supabase
    .from("shop_product_variants")
    .select("product_id, size, active, stock")
    .eq("product_id", product.id);
  return {
    slug: product.slug,
    code: product.code,
    name: product.name,
    description: product.description,
    image_src: product.image_src,
    price_cents: product.price_cents,
    sort_order: product.sort_order,
    created_at: product.created_at,
    sizes: mapVariants(variants, product.id),
  };
}

/**
 * Nouveauté = produit créé dans les `days` derniers jours. Par défaut 30j.
 */
export function isRecentlyCreated(
  iso: string,
  days = 30,
  now: Date = new Date()
): boolean {
  const created = Date.parse(iso);
  if (!Number.isFinite(created)) return false;
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return created >= cutoff;
}
