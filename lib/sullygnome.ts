import { createServerClient } from "./supabase/server";

// Stats SullyGnome via leurs endpoints JSON internes (Highcharts config).
// Bien plus fiable que le HTML scraping : les endpoints renvoient des objets
// Highcharts avec series[0].data, faciles à parser, peu sujets aux faux positifs.
//
// IDs et URL fournis par l'utilisateur :
// - https://sullygnome.com/api/charts/linecharts/getconfig/ChannelViewers/7/0/74864444/InesPNJ/...
// - https://sullygnome.com/api/charts/linecharts/getconfig/ChannelFollowers/7/0/74864444/InesPNJ/...
// - https://sullygnome.com/api/charts/piecharts/getconfig/channelgamestreamedtime/7/74864444/InesPNJ/...
//
// Structure typique du payload Highcharts :
// { ..., series: [{ name, data: [[ts, val], [ts, val], ...] }] }  // line
// { ..., series: [{ name, data: [{ name: "GTA V", y: 12.5 }, ...] }] }  // pie

const SULLY_API_BASE = "https://sullygnome.com/api/charts";
const CHANNEL_ID = "74864444"; // InesPNJ channel id (récupérable via /api/standardsearch)
const CHANNEL_NAME = "InesPNJ";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type SullyPeriod = 7 | 14 | 30 | 90 | 365;

export type SullyStats = {
  period: SullyPeriod;
  peakViewers: number | null;
  averageViewers: number | null;
  followersGained: number | null;
  topGameByTime: { name: string; hours: number } | null;
  topGameByViewers: { name: string; viewers: number } | null;
};

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        Referer: `https://sullygnome.com/channel/${CHANNEL_NAME.toLowerCase()}/7`,
      },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.length < 100) return null;
    // Cloudflare challenge ?
    if (/just a moment|attention required|cloudflare/i.test(text.slice(0, 1500))) {
      return null;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// URL builders
// ---------------------------------------------------------------------------

function lineUrl(metric: string, period: SullyPeriod): string {
  // /{metric}/{period}/0/{channelId}/{channelName}/%20/%20/0/0/%20/0/
  return `${SULLY_API_BASE}/linecharts/getconfig/${metric}/${period}/0/${CHANNEL_ID}/${CHANNEL_NAME}/%20/%20/0/0/%20/0/`;
}

function pieUrl(metric: string, period: SullyPeriod): string {
  // /{metric}/{period}/{channelId}/{channelName}/%20/%20/0/0/%20/0/
  return `${SULLY_API_BASE}/piecharts/getconfig/${metric}/${period}/${CHANNEL_ID}/${CHANNEL_NAME}/%20/%20/0/0/%20/0/`;
}

// ---------------------------------------------------------------------------
// Parsers (Highcharts config shapes)
// ---------------------------------------------------------------------------

type LineConfig = {
  series?: Array<{
    name?: string;
    data?: Array<[number, number]> | number[];
  }>;
};

type PieConfig = {
  series?: Array<{
    name?: string;
    data?: Array<{ name?: string; y?: number }>;
  }>;
};

function lineSeriesValues(cfg: LineConfig | null): number[] {
  if (!cfg?.series?.[0]?.data) return [];
  const data = cfg.series[0].data;
  const values: number[] = [];
  for (const point of data) {
    if (typeof point === "number") {
      values.push(point);
    } else if (Array.isArray(point) && typeof point[1] === "number") {
      values.push(point[1]);
    }
  }
  return values;
}

function topPieSlice(cfg: PieConfig | null): { name: string; value: number } | null {
  if (!cfg?.series?.[0]?.data) return null;
  let best: { name: string; value: number } | null = null;
  for (const slice of cfg.series[0].data) {
    if (
      typeof slice.y === "number" &&
      slice.y > 0 &&
      typeof slice.name === "string" &&
      slice.name.trim() !== ""
    ) {
      if (!best || slice.y > best.value) {
        best = { name: slice.name, value: slice.y };
      }
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Cached version (read from Supabase)
// ---------------------------------------------------------------------------

export const SULLY_CACHE_KEY = (login: string, period: SullyPeriod) =>
  `sullygnome:${login.toLowerCase()}:${period}`;

export async function getCachedSullyStats(
  login: string,
  period: SullyPeriod = 7
): Promise<SullyStats | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("cached_data")
      .select("payload")
      .eq("key", SULLY_CACHE_KEY(login, period))
      .maybeSingle();
    if (error || !data?.payload) return null;
    return data.payload as SullyStats;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Live fetch (used by the cron to refresh the cache)
// ---------------------------------------------------------------------------

export async function fetchSullyGnomeStats(
  _login: string,
  period: SullyPeriod = 7
): Promise<SullyStats | null> {
  const REVALIDATE = 21600; // 6h
  const [viewersCfg, followersCfg, gameTimePie, gameViewersPie] = await Promise.all([
    fetchJson<LineConfig>(lineUrl("ChannelViewers", period), REVALIDATE),
    fetchJson<LineConfig>(lineUrl("ChannelFollowers", period), REVALIDATE),
    fetchJson<PieConfig>(pieUrl("channelgamestreamedtime", period), REVALIDATE),
    fetchJson<PieConfig>(pieUrl("channelgameavgviewers", period), REVALIDATE),
  ]);

  // Peak + average viewers depuis la série de viewers (on ignore les zéros — quand la
  // chaîne est offline, la valeur tombe à 0 et fausserait la moyenne).
  const viewerValues = lineSeriesValues(viewersCfg).filter((v) => v > 0);
  const peakViewers = viewerValues.length > 0 ? Math.max(...viewerValues) : null;
  const averageViewers =
    viewerValues.length > 0
      ? Math.round(viewerValues.reduce((a, b) => a + b, 0) / viewerValues.length)
      : null;

  // Followers gagnés = différence entre dernier et premier point de la période.
  const followersValues = lineSeriesValues(followersCfg);
  const followersGained =
    followersValues.length >= 2
      ? followersValues[followersValues.length - 1] - followersValues[0]
      : null;

  // Top jeu par temps streamé.
  const topTime = topPieSlice(gameTimePie);
  const topGameByTime = topTime
    ? { name: topTime.name, hours: topTime.value }
    : null;

  // Top jeu par viewers moyen.
  const topViewers = topPieSlice(gameViewersPie);
  const topGameByViewers = topViewers
    ? { name: topViewers.name, viewers: topViewers.value }
    : null;

  // Si toutes les requêtes ont raté (réseau down, Cloudflare, etc.), on ne renvoie rien.
  if (
    peakViewers === null &&
    averageViewers === null &&
    followersGained === null &&
    !topGameByTime &&
    !topGameByViewers
  ) {
    return null;
  }

  return {
    period,
    peakViewers,
    averageViewers,
    followersGained,
    topGameByTime,
    topGameByViewers,
  };
}
