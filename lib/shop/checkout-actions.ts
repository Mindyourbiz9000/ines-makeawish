"use server";

// Server actions du checkout mockup. La principale, placeMockOrderAction,
// crée une vraie ligne dans shop_orders + shop_order_items à partir du
// panier sérialisé en JSON. Une fois la commande créée, redirige vers
// /shop/success?ref=MOCK-XXXXXX. La page success lira la commande depuis
// la DB.
//
// Les prix sont relus côté serveur depuis lib/shop/products.ts (source de
// vérité actuelle). Quand on basculera la lecture du catalogue sur
// Supabase, on swap pour un getProductBySlug() async qui hit la DB.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/shop/products";

type IncomingLine = { slug: string; size: string; qty: number };

const REF_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateRef(): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += REF_CHARSET[Math.floor(Math.random() * REF_CHARSET.length)];
  }
  return `MOCK-${out}`;
}

function parseCart(raw: unknown): IncomingLine[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is IncomingLine =>
          !!l &&
          typeof l === "object" &&
          typeof (l as IncomingLine).slug === "string" &&
          typeof (l as IncomingLine).size === "string" &&
          typeof (l as IncomingLine).qty === "number" &&
          (l as IncomingLine).qty > 0
      )
      .slice(0, 50);
  } catch {
    return [];
  }
}

export async function placeMockOrderAction(formData: FormData) {
  const lines = parseCart(formData.get("cart_json"));
  if (lines.length === 0) {
    throw new Error("Panier vide ou invalide");
  }

  // Resolve prices + product details from the source of truth (lib/shop/products).
  type ResolvedItem = {
    slug: string;
    code: string;
    name: string;
    size: string;
    qty: number;
    unitPriceCents: number;
  };
  const resolved: ResolvedItem[] = [];
  for (const l of lines) {
    const p = getProductBySlug(l.slug);
    if (!p) continue;
    resolved.push({
      slug: l.slug,
      code: p.code,
      name: p.name,
      size: l.size,
      qty: Math.min(99, Math.max(1, Math.floor(l.qty))),
      unitPriceCents: p.priceCents,
    });
  }
  if (resolved.length === 0) {
    throw new Error("Aucun produit valide dans le panier");
  }

  const subtotal = resolved.reduce(
    (acc, i) => acc + i.unitPriceCents * i.qty,
    0
  );
  const ref = generateRef();
  const supabase = createServerClient();

  // Lookup customer-fournis fields (mostly placeholders en mockup mais on les
  // capture quand même au cas où on les expose un jour).
  const customer_email =
    (formData.get("email") as string | null)?.trim() || null;
  const customer_name =
    (formData.get("name") as string | null)?.trim() || null;

  // 1. Create the order
  const { data: order, error: orderErr } = await supabase
    .from("shop_orders")
    .insert({
      ref,
      status: "pending",
      customer_email,
      customer_name,
      subtotal_cents: subtotal,
      total_cents: subtotal, // mockup: pas de shipping/tax
      currency: "EUR",
      mock: true,
    })
    .select()
    .single();
  if (orderErr || !order) {
    throw new Error(`Création commande : ${orderErr?.message ?? "inconnue"}`);
  }

  // 2. Resolve DB product/variant ids by slug + size for FK references
  const slugs = Array.from(new Set(resolved.map((i) => i.slug)));
  const { data: dbProducts } = await supabase
    .from("shop_products")
    .select("id, slug")
    .in("slug", slugs);
  const productIdBySlug = new Map<string, number>();
  for (const p of dbProducts ?? []) productIdBySlug.set(p.slug, p.id);

  const productIds = Array.from(productIdBySlug.values());
  let variantIdByKey = new Map<string, number>();
  if (productIds.length > 0) {
    const { data: dbVariants } = await supabase
      .from("shop_product_variants")
      .select("id, product_id, size")
      .in("product_id", productIds);
    for (const v of dbVariants ?? []) {
      variantIdByKey.set(`${v.product_id}:${v.size}`, v.id);
    }
  }

  const itemRows = resolved.map((i) => {
    const productId = productIdBySlug.get(i.slug) ?? null;
    const variantId =
      productId !== null
        ? variantIdByKey.get(`${productId}:${i.size}`) ?? null
        : null;
    return {
      order_id: order.id,
      product_id: productId,
      variant_id: variantId,
      code: i.code,
      name: i.name,
      size: i.size,
      quantity: i.qty,
      unit_price_cents: i.unitPriceCents,
    };
  });

  // 3. Insert items (best-effort: si ça rate on garde l'order pour pouvoir debugger)
  if (itemRows.length > 0) {
    const { error: itemsErr } = await supabase
      .from("shop_order_items")
      .insert(itemRows);
    if (itemsErr) {
      // Rollback la commande pour pas laisser une coquille vide
      await supabase.from("shop_orders").delete().eq("id", order.id);
      throw new Error(`Création items : ${itemsErr.message}`);
    }
  }

  revalidatePath("/shop/admin");
  revalidatePath("/shop/admin/orders");
  redirect(`/shop/success?ref=${encodeURIComponent(ref)}`);
}
