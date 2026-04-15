// Endpoint interne qui agrège les infos Twitch via IVR.fi.
// Cache 30s côté Vercel pour éviter de spammer IVR tout en gardant
// une latence raisonnable sur le "LIVE" status.

import { NextResponse } from "next/server";

const IVR_URL = "https://api.ivr.fi/v2/twitch/user?login=inespnj";
const FOLLOWERS_FALLBACK = 14670;

type IvrUser = {
  followers?: number | null;
  stream?: unknown | null;
  lastBroadcast?: { title?: string | null } | null;
};

export const revalidate = 30;

export async function GET() {
  try {
    const res = await fetch(IVR_URL, { next: { revalidate: 30 } });
    if (!res.ok) {
      return NextResponse.json({
        followers: FOLLOWERS_FALLBACK,
        isLive: false,
        streamTitle: null,
      });
    }
    const data = (await res.json()) as IvrUser[] | IvrUser;
    const user = Array.isArray(data) ? data[0] : data;
    const followers =
      typeof user?.followers === "number" && user.followers > 0
        ? user.followers
        : FOLLOWERS_FALLBACK;
    const isLive = user?.stream != null;
    const streamTitle = isLive ? user?.lastBroadcast?.title ?? null : null;
    return NextResponse.json({ followers, isLive, streamTitle });
  } catch {
    return NextResponse.json({
      followers: FOLLOWERS_FALLBACK,
      isLive: false,
      streamTitle: null,
    });
  }
}
