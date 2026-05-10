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
import type { Database } from "@/lib/supabase/types";

type ProductUpdate = Database["public"]["Tables"]["shop_products"]["Update"];

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
// Image upload (Supabase Storage)
// ============================================================

const SHOP_BUCKET = "shop-images";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Slug URL-safe à partir d'un texte libre. Lowercase, sans accents, sans
 * caractères spéciaux, espaces et underscores → tirets, dashes consécutifs
 * collapsed, leading/trailing dashes trimmés. Max 60 chars. Renvoie "produit"
 * si l'entrée est vide après nettoyage.
 */
function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      // Strip combining diacritical marks (accents)
      .replace(/[̀-ͯ]/g, "")
      // Tout ce qui n'est pas alphanum devient un dash
      .replace(/[^a-z0-9]+/g, "-")
      // Collapse multiple dashes
      .replace(/-+/g, "-")
      // Trim leading/trailing dashes
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "produit"
  );
}

// Alias retro-compatible (utilisé par uploadProductImage pour le filename)
const slugifyForFilename = slugify;

/**
 * Cherche un slug unique dans shop_products. Si `base` existe déjà, essaie
 * `base-2`, `base-3`, ... jusqu'à 50, puis fallback timestamp.
 */
async function findUniqueProductSlug(base: string): Promise<string> {
  const supabase = createServerClient();
  const seed = slugify(base);
  let candidate = seed;
  for (let i = 2; i <= 50; i++) {
    const { data } = await supabase
      .from("shop_products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${seed}-${i}`;
  }
  // Hyper rare : 50 collisions. Fallback avec timestamp.
  return `${seed}-${Date.now()}`;
}

/**
 * Upload une image vers le bucket Storage 'shop-images' et retourne son URL
 * publique. Renvoie null si le fichier est absent ou invalide.
 */
async function uploadProductImage(
  file: File,
  slug: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `Image trop volumineuse (${Math.round(file.size / 1024 / 1024)} MB) — max ${MAX_IMAGE_BYTES / 1024 / 1024} MB`
    );
  }
  const supabase = createServerClient();
  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    (file.type === "image/png" ? "png" : "jpg");
  const path = `${slugifyForFilename(slug)}-${Date.now()}.${ext}`;
  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(SHOP_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (error) {
    throw new Error(`Upload image : ${error.message}`);
  }
  const { data } = supabase.storage.from(SHOP_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Lit le couple (image_file, image_src) du form. Si un fichier est fourni,
 * l'upload et retourne sa public URL. Sinon retourne le chemin texte (ou
 * undefined pour ne pas toucher au champ existant en update).
 */
async function resolveImageSrc(
  formData: FormData,
  slug: string
): Promise<string | null | undefined> {
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    return uploadProductImage(file, slug);
  }
  // Pas de fichier : on regarde le champ texte (fallback / chemin /public manuel)
  const textPath = formData.get("image_src");
  if (typeof textPath !== "string") return undefined; // champ absent
  const trimmed = textPath.trim();
  return trimmed === "" ? null : trimmed;
}

// ============================================================
// PRODUCTS
// ============================================================

export async function createProductAction(formData: FormData) {
  const name = readString(formData, "name");
  if (!name) {
    throw new Error("Le nom du produit est obligatoire");
  }
  // Le "code" (label court) est auto-rempli avec le nom. Si l'admin a fourni
  // un code explicite (champ avancé), on le respecte ; sinon code = name.
  const code = readString(formData, "code") ?? name;
  // Slug auto-généré à partir du nom (ex. "Hoodie crème" → "hoodie-creme").
  // En cas de collision, suffixe -2, -3, etc.
  const slug = await findUniqueProductSlug(name);
  const description = readString(formData, "description");
  const resolvedImage = await resolveImageSrc(formData, slug);
  const image_src = resolvedImage === undefined ? null : resolvedImage;
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
  // On NE met PAS à jour le slug en édition : changer un slug casserait les
  // URLs déjà partagées. Pour renommer un slug, supprime + recrée le produit.
  const supabase = createServerClient();
  const { data: existing } = await supabase
    .from("shop_products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const slug = existing?.slug ?? `product-${id}`;
  const resolvedImage = await resolveImageSrc(formData, slug);
  const newName = readString(formData, "name");
  // Quand le nom change, on synchronise aussi le code (qui sert de label court)
  // sauf si l'admin a fourni un code explicite.
  const explicitCode = readString(formData, "code");
  const update: ProductUpdate = {
    code: explicitCode ?? newName ?? undefined,
    name: newName ?? undefined,
    description: readString(formData, "description"),
    price_cents: readNumber(formData, "price_cents", 0),
    sort_order: readNumber(formData, "sort_order", 0),
    active: readBool(formData, "active"),
  };
  // Ne touche au champ image_src QUE si l'utilisateur a fourni quelque chose
  if (resolvedImage !== undefined) {
    update.image_src = resolvedImage;
  }
  const { error } = await supabase
    .from("shop_products")
    .update(update)
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

  // Synchronise le statut de la commande à partir du statut de la livraison.
  // C'est l'unique source de vérité du flow logistique : on ne peut plus
  // changer le statut d'une commande directement depuis /shop/admin/orders.
  let orderStatus:
    | "paid"
    | "shipped"
    | "delivered"
    | null = null;
  if (status === "preparing") orderStatus = "paid";
  else if (status === "shipped" || status === "in_transit")
    orderStatus = "shipped";
  else if (status === "delivered") orderStatus = "delivered";
  // exception : on ne change pas le statut commande automatiquement.
  if (orderStatus) {
    await supabase
      .from("shop_orders")
      .update({ status: orderStatus })
      .eq("id", order_id);
  }

  revalidatePath("/shop/admin");
  revalidatePath("/shop/admin/orders");
  revalidatePath("/shop/admin/deliveries");
}

/**
 * Annule une commande. Pour l'instant : flip status → 'cancelled' et marque
 * la livraison associée en 'exception' si elle existe.
 *
 * Quand on connectera Stripe, c'est ici qu'on déclenchera stripe.refunds.create()
 * pour rembourser le client automatiquement (cf. payment_intent stocké sur
 * shop_orders).
 */
export async function cancelOrderAction(formData: FormData) {
  const id = readNumber(formData, "id");
  if (!id) throw new Error("id manquant");
  const supabase = createServerClient();

  // Vérifie l'état actuel — on ne ré-annule pas une commande déjà annulée.
  const { data: existing } = await supabase
    .from("shop_orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) throw new Error("Commande introuvable");
  if (existing.status === "cancelled" || existing.status === "refunded") {
    return; // no-op : déjà annulée
  }

  const { error } = await supabase
    .from("shop_orders")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw new Error(`Annulation : ${error.message}`);

  // Si une livraison est en cours, on la marque en exception (pour notifier
  // qu'elle ne doit pas partir).
  await supabase
    .from("shop_deliveries")
    .update({ status: "exception", notes: "Commande annulée" })
    .eq("order_id", id);

  // TODO Stripe : si on a stripe_payment_intent stocké, déclencher un refund :
  //   await stripe.refunds.create({ payment_intent: order.stripe_payment_intent });
  //   await supabase.from('shop_orders').update({ status: 'refunded' }).eq('id', id);

  revalidatePath("/shop/admin");
  revalidatePath("/shop/admin/orders");
  revalidatePath("/shop/admin/deliveries");
}
