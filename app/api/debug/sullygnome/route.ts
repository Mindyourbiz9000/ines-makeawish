// Diagnostic endpoint pour comprendre pourquoi les fetches SullyGnome ratent en prod.
// Hit https://<ton-site>/api/debug/sullygnome dans le navigateur, partage le résultat.
//
// Renvoie pour chacun des 5 endpoints SullyGnome :
//  - URL appelée
//  - Status HTTP
//  - Content-Type
//  - Taille de la réponse
//  - Premiers 500 caractères de la réponse (pour voir si Cloudflare a renvoyé du HTML)
//  - Résultat de JSON.parse (ou message d'erreur)

import { NextResponse } from "next/server";

const CHANNEL_ID = "74864444";
const CHANNEL_NAME = "InesPNJ";
const PERIOD = 7;
const SULLY_API_BASE = "https://sullygnome.com/api/charts";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const ENDPOINTS = [
  {
    name: "ChannelViewers",
    url: `${SULLY_API_BASE}/linecharts/getconfig/ChannelViewers/${PERIOD}/0/${CHANNEL_ID}/${CHANNEL_NAME}/%20/%20/0/0/%20/0/`,
  },
  {
    name: "ChannelFollowers",
    url: `${SULLY_API_BASE}/linecharts/getconfig/ChannelFollowers/${PERIOD}/0/${CHANNEL_ID}/${CHANNEL_NAME}/%20/%20/0/0/%20/0/`,
  },
  {
    name: "ChannelRank",
    url: `${SULLY_API_BASE}/linecharts/getconfig/ChannelRank/${PERIOD}/0/${CHANNEL_ID}/${CHANNEL_NAME}/%20/%20/0/0/%20/0/`,
  },
  {
    name: "channelgameavgviewers",
    url: `${SULLY_API_BASE}/piecharts/getconfig/channelgameavgviewers/${PERIOD}/${CHANNEL_ID}/${CHANNEL_NAME}/%20/%20/0/0/%20/0/`,
  },
  {
    name: "channelgamestreamedtime",
    url: `${SULLY_API_BASE}/piecharts/getconfig/channelgamestreamedtime/${PERIOD}/${CHANNEL_ID}/${CHANNEL_NAME}/%20/%20/0/0/%20/0/`,
  },
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function probe(name: string, url: string) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        Referer: `https://sullygnome.com/channel/${CHANNEL_NAME.toLowerCase()}/${PERIOD}`,
      },
      cache: "no-store",
    });
    const text = await res.text();
    const elapsedMs = Date.now() - started;
    let parsed: unknown = null;
    let parseError: string | null = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parseError = (e as Error).message;
    }
    return {
      name,
      url,
      status: res.status,
      ok: res.ok,
      contentType: res.headers.get("content-type"),
      bodySize: text.length,
      elapsedMs,
      bodyPreview: text.slice(0, 500),
      parsedOk: parsed !== null,
      parsedSample:
        parsed && typeof parsed === "object"
          ? Object.keys(parsed as Record<string, unknown>).slice(0, 8)
          : null,
      seriesDataLength:
        parsed &&
        typeof parsed === "object" &&
        "series" in (parsed as Record<string, unknown>)
          ? Array.isArray((parsed as { series?: { data?: unknown[] }[] }).series)
            ? (parsed as { series: { data?: unknown[] }[] }).series[0]?.data?.length ??
              null
            : null
          : null,
      parseError,
    };
  } catch (e) {
    return {
      name,
      url,
      error: (e as Error).message,
      elapsedMs: Date.now() - started,
    };
  }
}

export async function GET() {
  const results = await Promise.all(ENDPOINTS.map((e) => probe(e.name, e.url)));
  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      runtime: "node",
      channel: { id: CHANNEL_ID, name: CHANNEL_NAME, period: PERIOD },
      results,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
