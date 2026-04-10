import { NextResponse } from "next/server";

// Source de vérité: la page Streamlabs Charity du stream.
// On la fetch côté serveur (Vercel), on extrait le bloc __NEXT_DATA__
// (les données initiales injectées par Next.js), et on cherche
// récursivement les entrées qui ressemblent à des donateurs.
const SOURCE_URL =
  "https://streamlabscharity.com/teams/@living-the-dream-2026/living-the-dream-2026?member=883764207819036315&l=fr-FR";

const CACHE_TTL_MS = 30_000; // 30s, aligné avec le polling client
const MAX_DONORS = 15;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type Donor = {
  name: string;
  amount: number; // montant en unité majeure (ex: euros)
  currency: string;
};

export type LeaderboardResponse = {
  donors: Donor[];
  fetchedAt: string;
  source: "next_data" | "html" | "unknown";
  debug?: unknown;
};

// Cache simple en mémoire (par instance serverless).
let cache: { data: LeaderboardResponse; timestamp: number } | null = null;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug") === "1";

  // Cache hit
  if (!debug && cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, max-age=30" },
    });
  }

  try {
    const res = await fetch(SOURCE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Source responded with ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // Extraire le bloc __NEXT_DATA__
    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]+?)<\/script>/
    );

    if (!nextDataMatch) {
      return NextResponse.json(
        {
          error: "__NEXT_DATA__ script tag not found in source HTML",
          htmlLength: html.length,
          htmlHead: html.slice(0, 500),
        },
        { status: 502 }
      );
    }

    let nextData: unknown;
    try {
      nextData = JSON.parse(nextDataMatch[1]);
    } catch (err) {
      return NextResponse.json(
        {
          error: `Failed to JSON.parse __NEXT_DATA__: ${(err as Error).message}`,
        },
        { status: 502 }
      );
    }

    const donors = findBestLeaderboard(nextData);

    const response: LeaderboardResponse = {
      donors: donors.slice(0, MAX_DONORS),
      fetchedAt: new Date().toISOString(),
      source: "next_data",
    };

    if (debug) {
      response.debug = {
        topLevelKeys: topLevelShape(nextData),
        donorsFound: donors.length,
        firstDonorRaw: donors[0] ?? null,
      };
    }

    cache = { data: response, timestamp: Date.now() };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, max-age=30" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Fetch error: ${(err as Error).message}` },
      { status: 502 }
    );
  }
}

// ------------------------------------------------------------
// Parsing heuristique du JSON Next.js
// ------------------------------------------------------------

/**
 * Parcourt l'objet récursivement à la recherche de la meilleure
 * "liste de donateurs". Une bonne liste contient au moins 2 entrées
 * qui ressemblent à `{ name, amount }`, triées par montant desc.
 */
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
      // Teste si c'est un array de donateurs
      if (node.length >= 2) {
        const donors = node
          .map(matchDonor)
          .filter((d): d is Donor => d !== null);
        if (donors.length >= Math.max(2, Math.floor(node.length * 0.5))) {
          if (donors.length > best.length) {
            best = donors;
          }
        }
      }
      // Recurse dans chaque élément
      for (const item of node) stack.push(item);
    } else {
      for (const value of Object.values(node as Record<string, unknown>)) {
        stack.push(value);
      }
    }
  }

  // Trie par montant descendant
  best.sort((a, b) => b.amount - a.amount);
  return best;
}

/**
 * Tente d'extraire un donateur à partir d'un objet.
 * Retourne null si ce n'est pas un donateur valide.
 */
function matchDonor(raw: unknown): Donor | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  // Chercher un nom dans les clés les plus courantes
  const name = firstString(
    o.displayName,
    o.display_name,
    o.name,
    o.username,
    o.donorName,
    o.donor_name,
    (o.donor as Record<string, unknown> | undefined)?.displayName,
    (o.donor as Record<string, unknown> | undefined)?.name,
    (o.user as Record<string, unknown> | undefined)?.displayName,
    (o.user as Record<string, unknown> | undefined)?.name
  );

  // Chercher un montant
  const amountRaw = firstNumber(
    o.amount,
    o.total,
    o.totalAmount,
    o.raisedAmount,
    o.raised_amount,
    o.amountInCents,
    o.amount_in_cents,
    (o.donationAmount as Record<string, unknown> | undefined)?.value,
    (o.amount as Record<string, unknown> | undefined)?.value
  );

  if (!name || amountRaw === null) return null;

  // Détection heuristique: si > 10000 c'est probablement en centimes
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

/** Sort une version allégée de la structure pour debug. */
function topLevelShape(root: unknown, depth = 0): unknown {
  if (depth > 2) return "…";
  if (root === null || typeof root !== "object") return typeof root;
  if (Array.isArray(root)) {
    return root.length === 0
      ? "[]"
      : `Array(${root.length})[${JSON.stringify(topLevelShape(root[0], depth + 1))}]`;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(root)) {
    out[k] = topLevelShape(v, depth + 1);
  }
  return out;
}
