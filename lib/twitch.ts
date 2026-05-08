// Helpers serveur pour récupérer les données publiques d'une chaîne Twitch.
// On utilise deux sources :
//   1. IVR.fi (https://api.ivr.fi/v2) pour le statut live + followers — simple, stable, sans auth.
//   2. L'endpoint GraphQL public de Twitch (gql.twitch.tv/gql) pour les goals, VODs, clips, schedule —
//      non documenté mais largement utilisé dans la communauté streaming.
//
// Toutes les fonctions sont défensives : sur la moindre erreur (réseau, HTTP, JSON, schéma),
// elles renvoient une valeur vide raisonnable au lieu de throw, pour que la page reste robuste.

const TWITCH_GQL_URL = "https://gql.twitch.tv/gql";
// Le client-id public utilisé par le site twitch.tv lui-même.
// Connu publiquement, pas de secret ici.
const TWITCH_PUBLIC_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

const IVR_BASE = "https://api.ivr.fi/v2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TwitchStream = {
  title: string;
  game: string | null;
  viewerCount: number;
  thumbnailUrl: string | null;
  startedAt: string | null;
};

export type TwitchLiveState = {
  followers: number;
  isLive: boolean;
  stream: TwitchStream | null;
  lastBroadcastTitle: string | null;
};

export type TwitchGoal = {
  type: string; // FOLLOWERS | NEW_SUBSCRIPTIONS | SUBSCRIPTIONS | BITS | CHANNEL_POINTS | PLUS_LEVEL | ...
  description: string;
  current: number;
  target: number;
  achieved: boolean;
};

export type TwitchVod = {
  id: string;
  title: string;
  lengthSeconds: number;
  viewCount: number;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  game: string | null;
  url: string;
};

export type TwitchClip = {
  slug: string;
  title: string;
  viewCount: number;
  durationSeconds: number;
  thumbnailUrl: string | null;
  url: string;
};

export type TwitchScheduleSegment = {
  startAt: string;
  endAt: string;
  title: string;
  category: string | null;
};

export type TwitchChannelStats = {
  createdAt: string | null;
  totalHours: number | null;
  totalClips: number | null;
  topCategory: string | null;
};

// ---------------------------------------------------------------------------
// GraphQL helper
// ---------------------------------------------------------------------------

async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
  revalidate: number
): Promise<T | null> {
  try {
    const res = await fetch(TWITCH_GQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": TWITCH_PUBLIC_CLIENT_ID,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T; errors?: unknown };
    if (json.errors || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Live state (IVR.fi — simple et stable)
// ---------------------------------------------------------------------------

const FOLLOWERS_FALLBACK = 14670;

type IvrUser = {
  followers?: number | null;
  stream?: {
    title?: string | null;
    game_name?: string | null;
    viewer_count?: number | null;
    thumbnail_url?: string | null;
    started_at?: string | null;
  } | null;
  lastBroadcast?: { title?: string | null } | null;
};

export async function fetchLiveState(
  login: string
): Promise<TwitchLiveState> {
  try {
    const res = await fetch(`${IVR_BASE}/twitch/user?login=${login}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return {
        followers: FOLLOWERS_FALLBACK,
        isLive: false,
        stream: null,
        lastBroadcastTitle: null,
      };
    }
    const data = (await res.json()) as IvrUser[] | IvrUser;
    const user = Array.isArray(data) ? data[0] : data;
    const followers =
      typeof user?.followers === "number" && user.followers > 0
        ? user.followers
        : FOLLOWERS_FALLBACK;
    const isLive = user?.stream != null;
    const stream: TwitchStream | null = isLive
      ? {
          title: user?.stream?.title ?? "",
          game: user?.stream?.game_name ?? null,
          viewerCount: user?.stream?.viewer_count ?? 0,
          thumbnailUrl: user?.stream?.thumbnail_url ?? null,
          startedAt: user?.stream?.started_at ?? null,
        }
      : null;
    return {
      followers,
      isLive,
      stream,
      lastBroadcastTitle: user?.lastBroadcast?.title ?? null,
    };
  } catch {
    return {
      followers: FOLLOWERS_FALLBACK,
      isLive: false,
      stream: null,
      lastBroadcastTitle: null,
    };
  }
}

// ---------------------------------------------------------------------------
// Channel goals (GraphQL)
// ---------------------------------------------------------------------------

type GoalsResponse = {
  user: {
    goals: {
      id: string;
      type: string;
      description: string | null;
      currentAmount: number;
      targetAmount: number;
      isAchieved: boolean;
    }[];
  } | null;
};

const GOALS_QUERY = /* GraphQL */ `
  query ChannelGoals($login: String!) {
    user(login: $login) {
      id
      goals {
        id
        type
        description
        currentAmount
        targetAmount
        isAchieved
      }
    }
  }
`;

export async function fetchTwitchGoals(login: string): Promise<TwitchGoal[]> {
  const data = await gql<GoalsResponse>(GOALS_QUERY, { login }, 60);
  if (!data?.user?.goals) return [];
  return data.user.goals.map((g) => ({
    type: g.type,
    description: g.description ?? "",
    current: g.currentAmount,
    target: g.targetAmount,
    achieved: g.isAchieved,
  }));
}

// ---------------------------------------------------------------------------
// Recent VODs (GraphQL) — used for "last broadcast" in offline state + replays
// ---------------------------------------------------------------------------

type VodsResponse = {
  user: {
    videos: {
      edges: {
        node: {
          id: string;
          title: string;
          lengthSeconds: number;
          viewCount: number;
          previewThumbnailURL: string | null;
          publishedAt: string | null;
          game: { name: string } | null;
        };
      }[];
    } | null;
  } | null;
};

const VODS_QUERY = /* GraphQL */ `
  query RecentVods($login: String!, $first: Int!) {
    user(login: $login) {
      videos(first: $first, type: ARCHIVE, sort: TIME) {
        edges {
          node {
            id
            title
            lengthSeconds
            viewCount
            previewThumbnailURL(width: 640, height: 360)
            publishedAt
            game {
              name
            }
          }
        }
      }
    }
  }
`;

export async function fetchRecentVods(
  login: string,
  limit = 3
): Promise<TwitchVod[]> {
  const data = await gql<VodsResponse>(
    VODS_QUERY,
    { login, first: limit },
    300
  );
  const edges = data?.user?.videos?.edges ?? [];
  return edges.map((e) => ({
    id: e.node.id,
    title: e.node.title,
    lengthSeconds: e.node.lengthSeconds,
    viewCount: e.node.viewCount,
    thumbnailUrl: e.node.previewThumbnailURL,
    publishedAt: e.node.publishedAt,
    game: e.node.game?.name ?? null,
    url: `https://www.twitch.tv/videos/${e.node.id}`,
  }));
}

// ---------------------------------------------------------------------------
// Top clips (GraphQL)
// ---------------------------------------------------------------------------

type ClipsResponse = {
  user: {
    clips: {
      edges: {
        node: {
          slug: string;
          title: string;
          viewCount: number;
          durationSeconds: number;
          thumbnailURL: string | null;
          url: string;
        };
      }[];
    } | null;
  } | null;
};

const CLIPS_QUERY = /* GraphQL */ `
  query TopClips($login: String!, $first: Int!) {
    user(login: $login) {
      clips(
        first: $first
        criteria: { filter: ALL, period: LAST_MONTH, sort: VIEWS_DESC }
      ) {
        edges {
          node {
            slug
            title
            viewCount
            durationSeconds
            thumbnailURL
            url
          }
        }
      }
    }
  }
`;

export async function fetchTopClips(
  login: string,
  limit = 6
): Promise<TwitchClip[]> {
  const data = await gql<ClipsResponse>(
    CLIPS_QUERY,
    { login, first: limit },
    600
  );
  const edges = data?.user?.clips?.edges ?? [];
  return edges.map((e) => ({
    slug: e.node.slug,
    title: e.node.title,
    viewCount: e.node.viewCount,
    durationSeconds: e.node.durationSeconds,
    thumbnailUrl: e.node.thumbnailURL,
    url: e.node.url,
  }));
}

// ---------------------------------------------------------------------------
// Schedule (GraphQL)
// ---------------------------------------------------------------------------

type ScheduleResponse = {
  user: {
    channel: {
      schedule: {
        segments: {
          id: string;
          startAt: string;
          endAt: string;
          title: string | null;
          categories: { name: string }[] | null;
        }[] | null;
      } | null;
    } | null;
  } | null;
};

const SCHEDULE_QUERY = /* GraphQL */ `
  query ChannelSchedule($login: String!) {
    user(login: $login) {
      channel {
        schedule {
          segments {
            id
            startAt
            endAt
            title
            categories {
              name
            }
          }
        }
      }
    }
  }
`;

export async function fetchSchedule(
  login: string,
  limit = 3
): Promise<TwitchScheduleSegment[]> {
  const data = await gql<ScheduleResponse>(SCHEDULE_QUERY, { login }, 300);
  const segments = data?.user?.channel?.schedule?.segments ?? [];
  const now = Date.now();
  const upcoming = segments
    .filter((s) => {
      const t = Date.parse(s.startAt);
      return Number.isFinite(t) && t >= now;
    })
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
    .slice(0, limit);
  return upcoming.map((s) => ({
    startAt: s.startAt,
    endAt: s.endAt,
    title: s.title ?? "Stream",
    category: s.categories?.[0]?.name ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Channel stats (GraphQL — created_at + derived)
// ---------------------------------------------------------------------------

type StatsResponse = {
  user: {
    createdAt: string | null;
    videos: {
      edges: {
        node: { lengthSeconds: number; game: { name: string } | null };
      }[];
    } | null;
    clips: { edges: { node: { slug: string } }[] } | null;
  } | null;
};

const STATS_QUERY = /* GraphQL */ `
  query ChannelStats($login: String!) {
    user(login: $login) {
      createdAt
      videos(first: 100, type: ARCHIVE, sort: TIME) {
        edges {
          node {
            lengthSeconds
            game {
              name
            }
          }
        }
      }
      clips(first: 100, criteria: { filter: ALL, period: ALL_TIME }) {
        edges {
          node {
            slug
          }
        }
      }
    }
  }
`;

export async function fetchChannelStats(
  login: string
): Promise<TwitchChannelStats> {
  const data = await gql<StatsResponse>(STATS_QUERY, { login }, 3600);
  const user = data?.user;
  if (!user) {
    return {
      createdAt: null,
      totalHours: null,
      totalClips: null,
      topCategory: null,
    };
  }
  const vods = user.videos?.edges ?? [];
  const totalSeconds = vods.reduce(
    (acc, e) => acc + (e.node.lengthSeconds ?? 0),
    0
  );
  const totalHours = totalSeconds > 0 ? Math.round(totalSeconds / 3600) : null;
  const categoryCounts = new Map<string, number>();
  for (const e of vods) {
    const name = e.node.game?.name;
    if (name) categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  }
  let topCategory: string | null = null;
  let topCount = 0;
  for (const [name, count] of categoryCounts) {
    if (count > topCount) {
      topCount = count;
      topCategory = name;
    }
  }
  const totalClips = user.clips?.edges?.length ?? null;
  return {
    createdAt: user.createdAt,
    totalHours,
    totalClips,
    topCategory,
  };
}
