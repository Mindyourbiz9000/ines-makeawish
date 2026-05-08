// Helper serveur pour récupérer les infos publiques de la chaîne Twitch via IVR.fi.
// IVR est une API communautaire stable, sans auth, qui wrappe l'API Helix de Twitch.
//
// On évite gql.twitch.tv (endpoint non documenté, fields incertains) — on prend
// uniquement ce qu'IVR nous donne. Si IVR est down ou ne renvoie pas un champ,
// chaque consommateur côté composant gère le `null` proprement (la section se cache).

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

export type TwitchLastBroadcast = {
  id: string | null;
  title: string | null;
  game: string | null;
  startedAt: string | null;
};

export type TwitchRoles = {
  isPartner: boolean;
  isAffiliate: boolean;
};

export type TwitchLiveState = {
  followers: number;
  isLive: boolean;
  stream: TwitchStream | null;
  lastBroadcast: TwitchLastBroadcast | null;
  createdAt: string | null;
  description: string | null;
  profileImageUrl: string | null;
  offlineImageUrl: string | null;
  chatColor: string | null;
  roles: TwitchRoles;
};

// ---------------------------------------------------------------------------
// Live state (IVR.fi)
// ---------------------------------------------------------------------------

const FOLLOWERS_FALLBACK = 14670;

const EMPTY_STATE: TwitchLiveState = {
  followers: FOLLOWERS_FALLBACK,
  isLive: false,
  stream: null,
  lastBroadcast: null,
  createdAt: null,
  description: null,
  profileImageUrl: null,
  offlineImageUrl: null,
  chatColor: null,
  roles: { isPartner: false, isAffiliate: false },
};

// On modélise large : tous les champs IVR sont optionnels parce que le schéma
// peut bouger sans préavis et certaines chaînes n'exposent pas tout.
type IvrUser = {
  id?: string | null;
  login?: string | null;
  displayName?: string | null;
  description?: string | null;
  profileImageUrl?: string | null;
  offlineImageUrl?: string | null;
  createdAt?: string | null;
  followers?: number | null;
  chatColor?: string | null;
  roles?: {
    isAffiliate?: boolean | null;
    isPartner?: boolean | null;
  } | null;
  stream?: {
    title?: string | null;
    type?: string | null;
    game_name?: string | null;
    gameName?: string | null;
    viewer_count?: number | null;
    viewersCount?: number | null;
    thumbnail_url?: string | null;
    thumbnailUrl?: string | null;
    started_at?: string | null;
    startedAt?: string | null;
  } | null;
  lastBroadcast?: {
    id?: string | null;
    title?: string | null;
    game_name?: string | null;
    gameName?: string | null;
    started_at?: string | null;
    startedAt?: string | null;
  } | null;
};

function pickStream(s: NonNullable<IvrUser["stream"]>): TwitchStream {
  return {
    title: s.title ?? "",
    game: s.gameName ?? s.game_name ?? null,
    viewerCount: s.viewersCount ?? s.viewer_count ?? 0,
    thumbnailUrl: s.thumbnailUrl ?? s.thumbnail_url ?? null,
    startedAt: s.startedAt ?? s.started_at ?? null,
  };
}

function pickLastBroadcast(
  b: NonNullable<IvrUser["lastBroadcast"]>
): TwitchLastBroadcast {
  return {
    id: b.id ?? null,
    title: b.title ?? null,
    game: b.gameName ?? b.game_name ?? null,
    startedAt: b.startedAt ?? b.started_at ?? null,
  };
}

export async function fetchLiveState(
  login: string
): Promise<TwitchLiveState> {
  try {
    const res = await fetch(`${IVR_BASE}/twitch/user?login=${login}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return EMPTY_STATE;
    const data = (await res.json()) as IvrUser[] | IvrUser;
    const user = Array.isArray(data) ? data[0] : data;
    if (!user) return EMPTY_STATE;
    const followers =
      typeof user.followers === "number" && user.followers > 0
        ? user.followers
        : FOLLOWERS_FALLBACK;
    return {
      followers,
      isLive: user.stream != null,
      stream: user.stream ? pickStream(user.stream) : null,
      lastBroadcast: user.lastBroadcast
        ? pickLastBroadcast(user.lastBroadcast)
        : null,
      createdAt: user.createdAt ?? null,
      description: user.description ?? null,
      profileImageUrl: user.profileImageUrl ?? null,
      offlineImageUrl: user.offlineImageUrl ?? null,
      chatColor: user.chatColor ?? null,
      roles: {
        isPartner: !!user.roles?.isPartner,
        isAffiliate: !!user.roles?.isAffiliate,
      },
    };
  } catch {
    return EMPTY_STATE;
  }
}
