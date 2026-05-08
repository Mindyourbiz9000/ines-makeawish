"use server";

// Server actions pour /shop/admin. Toutes utilisent createServerClient()
// (secret key, bypass RLS). Appelables directement depuis des <form> JSX.
//
// Validation : on lit FormData manuellement et on convertit. Pour un mockup
// admin sans auth, on ne fait pas de zod / yup — juste des `Number()` et des
// vérifs de base. À durcir si on ouvre le truc à des humains externes.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

const SIZES_DEFAULT = ["XS", "S", "M", "L", "XL", "XXL"];

function readString(form: FormData, key: string): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function readNumber(form: FormData, key: string, fallback = 0): number {
  const v = form.get(key);
  if (typeof v !== "string") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function readBool(form: FormData, key: string): boolean {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
}

// ============================================================
// PRODUCTS
// ============================================================

export async function createProductAction(formData: FormData) {
  const slug = readString(formData, "slug");
  const code = readString(formData, "code");
  const name = readString(formData, "name");
  if (!slug || !code || !name) {
    throw new Error("slug, code et name sont obligatoires");
  }
  const description = readString(formData, "description");
  const image_src = readString(formData, "image_src");
  const price_cents = readNumber(formData, "price_cents", 0);
  const sort_order = readNumber(formData, "sort_order", 0);
  const sizesRaw = readString(formData, "sizes");
  const sizes =
    sizesRaw
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? SIZES_DEFAULT;

  const supabase = createServerClient();
  const { data: product, error } = await supabase
    .from("shop_products")
    .insert({
      slug,
      code,
      name,
      description,
      image_src,
      price_cents,
      sort_order,
      active: true,
    })
    .select()
    .single();
  if (error || !product) {
    throw new Error(`Création produit : ${error?.message ?? "inconnue"}`);
  }
  // Crée les variants
  if (sizes.length > 0) {
    await supabase.from("shop_product_variants").insert(
      sizes.map((s) => ({ product_id: product.id, size: s, stock: 10 }))
    );
  }
  revalidatePath("/shop/admin");
  revalidatePath("/shop/admin/products");
  redirect("/shop/admin/products");
}

export async function updateProductAction(formData: FormData) {
  const id = readNumber(formData, "id");
  if (!id) throw new Error("id manquant");
  const supabase = createServerClient();
  const { error } = await supabase
    .from("shop_products")
    .update({
      slug: readString(formData, "slug") ?? undefined,
      code: readString(formData, "code") ?? undefined,
      name: readString(formData, "name") ?? undefined,
      description: readString(formData, "description"),
      image_src: readString(formData, "image_src"),
      price_cents: readNumber(formData, "price_cents", 0),
      sort_order: readNumber(formData, "sort_order", 0),
      active: readBool(formData, "active"),
    })
    .eq("id", id);
  if (error) throw new Error(`Update produit : ${error.message}`);
  revalidatePath("/shop/admin");
  revalidatePath("/shop/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  const id = readNumber(formData, "id");
  if (!id) throw new Error("id manquant");
  const supabase = createServerClient();
  // Hard delete — variants suppr en cascade par FK
  const { error } = await supabase.from("shop_products").delete().eq("id", id);
  if (error) throw new Error(`Suppression produit : ${error.message}`);
  revalidatePath("/shop/admin/products");
}

// ============================================================
// VARIANTS (stock per size)
// ============================================================

export async function updateVariantStockAction(formData: FormData) {
  const id = readNumber(formData, "variant_id");
  if (!id) throw new Error("variant_id manquant");
  const stock = Math.max(0, readNumber(formData, "stock", 0));
  const supabase = createServerClient();
  const { error } = await supabase
    .from("shop_product_variants")
    .update({ stock })
    .eq("id", id);
  if (error) throw new Error(`Update stock : ${error.message}`);
  revalidatePath("/shop/admin/products");
}

export async function addVariantAction(formData: FormData) {
  const product_id = readNumber(formData, "product_id");
  const size = readString(formData, "size");
  if (!product_id || !size) throw new Error("product_id et size requis");
  const stock = readNumber(formData, "stock", 0);
  const supabase = createServerClient();
  const { error } = await supabase
    .from("shop_product_variants")
    .insert({ product_id, size, stock });
  if (error) throw new Error(`Ajout variant : ${error.message}`);
  revalidatePath("/shop/admin/products");
}

export async function deleteVariantAction(formData: FormData) {
  const id = readNumber(formData, "variant_id");
  if (!id) throw new Error("variant_id manquant");
  const supabase = createServerClient();
  const { error } = await supabase
    .from("shop_product_variants")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`Suppression variant : ${error.message}`);
  revalidatePath("/shop/admin/products");
}

// ============================================================
// ORDERS
// ============================================================

export async function updateOrderStatusAction(formData: FormData) {
  const id = readNumber(formData, "id");
  if (!id) throw new Error("id manquant");
  const status = readString(formData, "status");
  const allowed = [
    "pending",
    "paid",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ] as const;
  if (!status || !allowed.includes(status as (typeof allowed)[number])) {
    throw new Error("Statut invalide");
  }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("shop_orders")
    .update({ status: status as (typeof allowed)[number] })
    .eq("id", id);
  if (error) throw new Error(`Update statut : ${error.message}`);

  // Auto-création d'une delivery quand on passe en "shipped" la première fois
  if (status === "shipped") {
    const { data: existing } = await supabase
      .from("shop_deliveries")
      .select("id")
      .eq("order_id", id)
      .maybeSingle();
    if (!existing) {
      await supabase.from("shop_deliveries").insert({
        order_id: id,
        status: "shipped",
        shipped_at: new Date().toISOString(),
      });
    }
  }

  revalidatePath("/shop/admin");
  revalidatePath("/shop/admin/orders");
  revalidatePath("/shop/admin/deliveries");
}

// ============================================================
// DELIVERIES
// ============================================================

export async function upsertDeliveryAction(formData: FormData) {
  const order_id = readNumber(formData, "order_id");
  if (!order_id) throw new Error("order_id manquant");
  const carrier = readString(formData, "carrier");
  const tracking_number = readString(formData, "tracking_number");
  const status = readString(formData, "status") ?? "preparing";
  const notes = readString(formData, "notes");
  const allowed = [
    "preparing",
    "shipped",
    "in_transit",
    "delivered",
    "exception",
  ] as const;
  if (!allowed.includes(status as (typeof allowed)[number])) {
    throw new Error("Statut invalide");
  }
  const supabase = createServerClient();

  // Met à jour shipped_at / delivered_at quand le statut change vers shipped/delivered
  const now = new Date().toISOString();
  const updates: {
    carrier: string | null;
    tracking_number: string | null;
    status: (typeof allowed)[number];
    notes: string | null;
    shipped_at?: string;
    delivered_at?: string;
  } = {
    carrier,
    tracking_number,
    status: status as (typeof allowed)[number],
    notes,
  };
  if (status === "shipped" || status === "in_transit") {
    updates.shipped_at = now;
  }
  if (status === "delivered") {
    updates.delivered_at = now;
  }

  const { error } = await supabase
    .from("shop_deliveries")
    .upsert(
      { order_id, ...updates },
      { onConflict: "order_id" }
    );
  if (error) throw new Error(`Upsert delivery : ${error.message}`);
  revalidatePath("/shop/admin/deliveries");
}
