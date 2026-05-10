// Diagnostic : vérifie que les tables shop_orders / shop_order_items / shop_deliveries
// existent et sont accessibles avec la secret key. Hit /api/debug/shop-orders.

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function probeTable(table: string) {
  try {
    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error, count } = await (supabase as any)
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) {
      return {
        exists: false,
        error: error.message,
        hint: (error as { hint?: string }).hint ?? null,
      };
    }
    return { exists: true, rowCount: count ?? 0, sample: data ?? null };
  } catch (e) {
    return { exists: false, error: (e as Error).message };
  }
}

export async function GET() {
  const tables = [
    "shop_products",
    "shop_product_variants",
    "shop_orders",
    "shop_order_items",
    "shop_deliveries",
    "shop_settings",
  ];
  const results: Record<string, unknown> = {};
  for (const t of tables) {
    results[t] = await probeTable(t);
  }
  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      tables: results,
      hint: "Si shop_orders/shop_order_items/shop_deliveries renvoient une erreur, il faut exécuter la migration 0005_shop_orders_deliveries.sql dans Supabase.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
