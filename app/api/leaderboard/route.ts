import { NextResponse } from "next/server";

// Endpoint public (pas d'auth) de Streamlabs Charity qui renvoie
// { top_streamers: [...], top_donators: [...] } pour une team.
// ID numérique trouvé dans devtools Network tab pour
// https://streamlabscharity.com/teams/@living-the-dream-2026/living-the-dream-2026
const LEADERBOARDS_URL =
  "https://streamlabscharity.com/api/v1/teams/921357223953833767/leaderboards";

const CACHE_TTL_MS = 10_000;
const MAX_STREAMERS = 15;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type Streamer = {
  name: string;
  amount: number; // en unité majeure (euros)
};

export type LeaderboardResponse = {
  streamers: Streamer[];
  fetchedAt: string;
};

type RawStreamer = {
  display_name?: string;
  amount?: string | number;
};

// Cache simple en mémoire (par instance serverless).
let cache: { data: LeaderboardResponse; timestamp: number } | null = null;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug") === "1";

  if (!debug && cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, max-age=10" },
    });
  }

  try {
    const res = await fetch(LEADERBOARDS_URL, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Streamlabs Charity responded with ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      top_streamers?: RawStreamer[];
    };

    if (debug) {
      return NextResponse.json({ raw: data });
    }

    const raw = data.top_streamers;
    if (!Array.isArray(raw)) {
      return NextResponse.json(
        { error: "top_streamers missing in API response" },
        { status: 502 }
      );
    }

    // Le champ `amount` est renvoyé comme string en centimes (ex: "856667" = 8566.67€).
    const streamers: Streamer[] = raw
      .map((s) => {
        const name = typeof s.display_name === "string" ? s.display_name : null;
        const cents =
          typeof s.amount === "string"
            ? parseInt(s.amount, 10)
            : typeof s.amount === "number"
              ? s.amount
              : NaN;
        if (!name || !isFinite(cents)) return null;
        return { name, amount: cents / 100 };
      })
      .filter((s): s is Streamer => s !== null)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, MAX_STREAMERS);

    const response: LeaderboardResponse = {
      streamers,
      fetchedAt: new Date().toISOString(),
    };

    cache = { data: response, timestamp: Date.now() };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, max-age=10" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Fetch error: ${(err as Error).message}` },
      { status: 502 }
    );
  }
}
