// Server-side queries pour /shop/admin. Toutes utilisent createServerClient()
// (secret key, bypass RLS). À ne jamais importer depuis un client component.

import { createServerClient } from "@/lib/supabase/server";

export type AdminProductRow = {
  id: number;
  slug: string;
  code: string;
  name: string;
  description: string | null;
  image_src: string | null;
  price_cents: number;
  sort_order: number;
  active: boolean;
  variants: AdminVariantRow[];
};

export type AdminVariantRow = {
  id: number;
  product_id: number;
  size: string;
  stock: number;
  active: boolean;
};

export type AdminOrderRow = {
  id: number;
  ref: string;
  status:
    | "pending"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  customer_email: string | null;
  customer_name: string | null;
  subtotal_cents: number;
  total_cents: number;
  currency: string;
  mock: boolean;
  created_at: string;
  item_count: number;
};

export type AdminOrderItemRow = {
  id: number;
  order_id: number;
  product_id: number | null;
  variant_id: number | null;
  code: string;
  name: string;
  size: string;
  quantity: number;
  unit_price_cents: number;
};

export type AdminDeliveryRow = {
  id: number;
  order_id: number;
  ref: string; // order ref, joined
  carrier: string | null;
  tracking_number: string | null;
  status:
    | "preparing"
    | "shipped"
    | "in_transit"
    | "delivered"
    | "exception";
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  updated_at: string;
};

export async function listAllProducts(): Promise<AdminProductRow[]> {
  const supabase = createServerClient();
  const { data: products, error } = await supabase
    .from("shop_products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !products) return [];
  const ids = products.map((p) => p.id);
  if (ids.length === 0) return [];
  const { data: variants } = await supabase
    .from("shop_product_variants")
    .select("*")
    .in("product_id", ids);
  const byProduct = new Map<number, AdminVariantRow[]>();
  for (const v of variants ?? []) {
    if (!byProduct.has(v.product_id)) byProduct.set(v.product_id, []);
    byProduct.get(v.product_id)!.push({
      id: v.id,
      product_id: v.product_id,
      size: v.size,
      stock: v.stock,
      active: v.active,
    });
  }
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    code: p.code,
    name: p.name,
    description: p.description,
    image_src: p.image_src,
    price_cents: p.price_cents,
    sort_order: p.sort_order,
    active: p.active,
    variants: (byProduct.get(p.id) ?? []).sort((a, b) =>
      a.size.localeCompare(b.size)
    ),
  }));
}

export async function getProductById(id: number): Promise<AdminProductRow | null> {
  const supabase = createServerClient();
  const { data: product } = await supabase
    .from("shop_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!product) return null;
  const { data: variants } = await supabase
    .from("shop_product_variants")
    .select("*")
    .eq("product_id", id);
  return {
    id: product.id,
    slug: product.slug,
    code: product.code,
    name: product.name,
    description: product.description,
    image_src: product.image_src,
    price_cents: product.price_cents,
    sort_order: product.sort_order,
    active: product.active,
    variants: (variants ?? []).map((v) => ({
      id: v.id,
      product_id: v.product_id,
      size: v.size,
      stock: v.stock,
      active: v.active,
    })),
  };
}

export async function listAllOrders(limit = 100): Promise<AdminOrderRow[]> {
  const supabase = createServerClient();
  const { data: orders } = await supabase
    .from("shop_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!orders) return [];
  // count items per order
  const ids = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("shop_order_items")
    .select("order_id, quantity")
    .in("order_id", ids);
  const counts = new Map<number, number>();
  for (const it of items ?? []) {
    counts.set(it.order_id, (counts.get(it.order_id) ?? 0) + it.quantity);
  }
  return orders.map((o) => ({
    id: o.id,
    ref: o.ref,
    status: o.status,
    customer_email: o.customer_email,
    customer_name: o.customer_name,
    subtotal_cents: o.subtotal_cents,
    total_cents: o.total_cents,
    currency: o.currency,
    mock: o.mock,
    created_at: o.created_at,
    item_count: counts.get(o.id) ?? 0,
  }));
}

export async function getOrderWithItems(id: number): Promise<{
  order: AdminOrderRow;
  items: AdminOrderItemRow[];
} | null> {
  const supabase = createServerClient();
  const { data: order } = await supabase
    .from("shop_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!order) return null;
  const { data: items } = await supabase
    .from("shop_order_items")
    .select("*")
    .eq("order_id", id);
  return {
    order: {
      id: order.id,
      ref: order.ref,
      status: order.status,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      subtotal_cents: order.subtotal_cents,
      total_cents: order.total_cents,
      currency: order.currency,
      mock: order.mock,
      created_at: order.created_at,
      item_count: (items ?? []).reduce((acc, it) => acc + it.quantity, 0),
    },
    items: (items ?? []).map((it) => ({
      id: it.id,
      order_id: it.order_id,
      product_id: it.product_id,
      variant_id: it.variant_id,
      code: it.code,
      name: it.name,
      size: it.size,
      quantity: it.quantity,
      unit_price_cents: it.unit_price_cents,
    })),
  };
}

export async function listAllDeliveries(): Promise<AdminDeliveryRow[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("shop_deliveries")
    .select("*, shop_orders!inner(ref)")
    .order("updated_at", { ascending: false });
  if (!data) return [];
  return data.map((d) => ({
    id: d.id,
    order_id: d.order_id,
    ref:
      (d as unknown as { shop_orders?: { ref?: string } }).shop_orders?.ref ?? "",
    carrier: d.carrier,
    tracking_number: d.tracking_number,
    status: d.status,
    shipped_at: d.shipped_at,
    delivered_at: d.delivered_at,
    notes: d.notes,
    updated_at: d.updated_at,
  }));
}
