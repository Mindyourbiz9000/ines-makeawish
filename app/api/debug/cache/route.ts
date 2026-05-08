// Inspecte la table cached_data : est-ce que la migration a tourné ? quelles entrées ?
// Hit /api/debug/cache pour debug.

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { SULLY_CACHE_KEY } from "@/lib/sullygnome";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  let envOk = true;
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    envOk = false;
  }

  let supabase;
  try {
    supabase = createServerClient();
  } catch (e) {
    return NextResponse.json({
      envOk,
      error: "createServerClient() threw",
      message: (e as Error).message,
    });
  }

  // Liste TOUTES les lignes de cached_data — sert à confirmer que la table existe
  // et qu'on peut la lire avec les credentials actuels.
  const { data: rows, error: listError } = await supabase
    .from("cached_data")
    .select("key, fetched_at");

  // Lit spécifiquement la ligne pour sullygnome:inespnj:7
  const targetKey = SULLY_CACHE_KEY("inespnj", 7);
  const { data: targetRow, error: targetError } = await supabase
    .from("cached_data")
    .select("key, payload, fetched_at")
    .eq("key", targetKey)
    .maybeSingle();

  return NextResponse.json(
    {
      envOk,
      timestamp: new Date().toISOString(),
      table: {
        listError: listError ? listError.message : null,
        rowCount: rows?.length ?? 0,
        rows: rows ?? [],
      },
      target: {
        key: targetKey,
        error: targetError ? targetError.message : null,
        found: !!targetRow,
        fetched_at: targetRow?.fetched_at ?? null,
        payload: targetRow?.payload ?? null,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
