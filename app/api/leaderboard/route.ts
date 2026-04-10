import { NextResponse } from "next/server";

// Endpoint public (pas d'auth) de Streamlabs Charity qui renvoie le
// classement des membres d'une team. L'ID numérique de la team
// "Living the dream 2026" a été trouvé en inspectant la page.
// Source: devtools Network tab sur
// https://streamlabscharity.com/teams/@living-the-dream-2026/living-the-dream-2026
const LEADERBOARDS_URL =
  "https://streamlabscharity.com/api/v1/teams/921357223953833767/leaderboards";

const CACHE_TTL_MS = 10_000; // aligné avec le polling client
const MAX_DONORS = 15;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type Donor = {
  name: string;
  amount: number; // en unité majeure (ex: euros)
  currency: string;
};

export type LeaderboardResponse = {
  donors: Donor[];
  fetchedAt: string;
};

// Cache simple en mémoire (par instance serverless).
let cache: { data: LeaderboardResponse; timestamp: number } | null = null;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug") === "1";

  if (!debug && cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, max-age=30" },
    });
  }

  try {
    const res = await fetch(LEADERBOARDS_URL, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
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

    const data: unknown = await res.json();

    if (debug) {
      // Dump brut pour inspecter la structure si besoin
      return NextResponse.json({ raw: data }, { status: 200 });
    }

    const donors = findBestLeaderboard(data);
    if (donors.length === 0) {
      return NextResponse.json(
        {
          error:
            "Leaderboard JSON was fetched but no donor-like entries were found. Append ?debug=1 to inspect the raw payload.",
        },
        { status: 502 }
      );
    }

    const response: LeaderboardResponse = {
      donors: donors.slice(0, MAX_DONORS),
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

// ─── Parsing heuristique ──────────────────────────────────────────────
// Même logique que le parser qu'on avait fait pour __NEXT_DATA__: on
// walk récursivement le JSON et on retourne la plus grosse liste qui
// ressemble à un tableau de donateurs. Résilient aux changements de
// structure côté Streamlabs Charity.

function findBestLeaderboard(root: unknown): Donor[] {
  let best: Donor[] = [];

  const visited = new WeakSet<object>();
  const stack: unknown[] = [root];

  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    if (visited.has(node as object)) continue;
    visited.add(node as object);

    if (Array.isArray(node)) {
      if (node.length >= 2) {
        const donors = node
          .map(matchDonor)
          .filter((d): d is Donor => d !== null);
        if (
          donors.length >= 2 &&
          donors.length >= Math.floor(node.length * 0.5) &&
          donors.length > best.length
        ) {
          best = donors;
        }
      }
      for (const item of node) stack.push(item);
    } else {
      for (const value of Object.values(node as Record<string, unknown>)) {
        stack.push(value);
      }
    }
  }

  best.sort((a, b) => b.amount - a.amount);
  return best;
}

function matchDonor(raw: unknown): Donor | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const name = firstString(
    o.displayName,
    o.display_name,
    o.name,
    o.username,
    o.donorName,
    o.donor_name,
    o.streamer_name,
    o.streamerName,
    (o.donor as Record<string, unknown> | undefined)?.displayName,
    (o.donor as Record<string, unknown> | undefined)?.name,
    (o.user as Record<string, unknown> | undefined)?.displayName,
    (o.user as Record<string, unknown> | undefined)?.name,
    (o.member as Record<string, unknown> | undefined)?.displayName,
    (o.member as Record<string, unknown> | undefined)?.name
  );

  const amountRaw = firstNumber(
    o.amount,
    o.total,
    o.totalAmount,
    o.total_amount,
    o.raisedAmount,
    o.raised_amount,
    o.amountInCents,
    o.amount_in_cents,
    o.raised,
    (o.donationAmount as Record<string, unknown> | undefined)?.value,
    (o.amount as Record<string, unknown> | undefined)?.value,
    (o.total as Record<string, unknown> | undefined)?.value
  );

  if (!name || amountRaw === null) return null;

  // Heuristique: > 10000 → probablement en centimes
  const amount = amountRaw > 10000 ? amountRaw / 100 : amountRaw;

  const currency =
    firstString(
      o.currency,
      o.currencyCode,
      o.currency_code,
      (o.amount as Record<string, unknown> | undefined)?.currency
    ) ?? "EUR";

  return { name, amount, currency };
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

function firstNumber(...values: unknown[]): number | null {
  for (const v of values) {
    if (typeof v === "number" && isFinite(v)) return v;
    if (typeof v === "string") {
      const n = parseFloat(v);
      if (isFinite(n)) return n;
    }
  }
  return null;
}
