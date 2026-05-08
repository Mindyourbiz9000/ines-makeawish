// Cron route hit toutes les heures par Vercel pour rafraîchir les stats SullyGnome.
// Programmation dans vercel.json :
//   { "path": "/api/cron/refresh-stats", "schedule": "0 * * * *" }
//
// Vercel injecte automatiquement le header `Authorization: Bearer <CRON_SECRET>`
// si la variable d'env CRON_SECRET est définie. On vérifie ce header pour bloquer
// les appels externes.
//
// Si on n'a pas réussi à fetch SullyGnome, on n'écrase PAS le cache existant —
// mieux vaut afficher des stats légèrement périmées que rien du tout.

import { NextResponse, type NextRequest } from "next/server";
import {
  fetchSullyGnomeStats,
  SULLY_CACHE_KEY,
  type SullyPeriod,
} from "@/lib/sullygnome";
import { createServerClient } from "@/lib/supabase/server";

const TWITCH_LOGIN = "inespnj";
const PERIODS: SullyPeriod[] = [7];

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // Pas de secret configuré → on autorise (utile en dev / premier setup).
  if (!secret) return true;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const results: Array<{
    period: SullyPeriod;
    refreshed: boolean;
    reason?: string;
  }> = [];

  for (const period of PERIODS) {
    const stats = await fetchSullyGnomeStats(TWITCH_LOGIN, period);
    if (!stats) {
      results.push({
        period,
        refreshed: false,
        reason: "fetch returned null (Cloudflare ? schema ?)",
      });
      continue;
    }
    const { error } = await supabase
      .from("cached_data")
      .upsert(
        {
          key: SULLY_CACHE_KEY(TWITCH_LOGIN, period),
          payload: stats,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    if (error) {
      results.push({ period, refreshed: false, reason: error.message });
    } else {
      results.push({ period, refreshed: true });
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results,
  });
}
