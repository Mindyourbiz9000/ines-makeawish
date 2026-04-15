// Server component : fetch le flux RSS.app (JSON Feed 1.1) et affiche
// les 3 derniers TikToks d'@inespnj.
//
// On utilise `unstable_cache` (et NON juste `fetch(..., { next: { revalidate }})`)
// parce que app/page.tsx a `dynamic = "force-dynamic"` qui désactive le cache
// de tous les fetch de la page. `unstable_cache` est indépendant de ce flag :
// il garantit 1 seul hit RSS.app toutes les REVALIDATE_SECONDS, peu importe
// le nombre de visiteurs. Essentiel pour ne pas exploser le free tier.

import { unstable_cache } from "next/cache";

type JsonFeedItem = {
  id?: string;
  url?: string;
  external_url?: string;
  title?: string;
  date_published?: string;
};

type JsonFeed = {
  items?: JsonFeedItem[];
};

type VideoMeta = { id: string; date: string | null };

const FEED_URL = "https://rss.app/feeds/v1.1/8DhlPr0ieIAeg7cV.json";
const REVALIDATE_SECONDS = 3600; // 1h

function extractVideoId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

// Fetch non caché (la couche de cache est gérée par unstable_cache plus bas).
async function fetchFreshVideoMeta(): Promise<VideoMeta[]> {
  try {
    const res = await fetch(FEED_URL, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as JsonFeed;
    const metas: VideoMeta[] = [];
    const seen = new Set<string>();
    for (const item of data.items ?? []) {
      const id =
        extractVideoId(item.url) ??
        extractVideoId(item.external_url) ??
        extractVideoId(item.id);
      if (id && !seen.has(id)) {
        seen.add(id);
        metas.push({ id, date: item.date_published ?? null });
        if (metas.length === 3) break;
      }
    }
    return metas;
  } catch {
    return [];
  }
}

// Cache partagé entre toutes les requêtes. Survit à `force-dynamic`.
// Revalidation toutes les 1h : max 24 hits RSS.app par jour, peu importe
// le trafic.
const getCachedVideoMeta = unstable_cache(
  fetchFreshVideoMeta,
  ["tiktok-reels-meta"],
  { revalidate: REVALIDATE_SECONDS, tags: ["tiktok"] }
);

function formatRelativeDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function TikTokReels() {
  const videos = await getCachedVideoMeta();
  if (videos.length === 0) return null;

  return (
    <section className="mt-10">
      <p className="mb-5 text-center text-[10px] uppercase tracking-[0.3em] text-white/50 sm:text-xs">
        Mes derniers TikToks
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {videos.map((video) => {
          const dateLabel = formatRelativeDate(video.date);
          return (
            <div key={video.id} className="flex flex-col gap-2">
              <div className="aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-black">
                <iframe
                  src={`https://www.tiktok.com/player/v1/${video.id}?music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0`}
                  className="h-full w-full"
                  allow="encrypted-media; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  scrolling="no"
                  title={`TikTok video ${video.id}`}
                  loading="lazy"
                />
              </div>
              {dateLabel && (
                <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/50">
                  {dateLabel}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-white/40">
        <a
          href="https://www.tiktok.com/@inespnj"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/70 hover:decoration-white/60"
        >
          Voir tout sur TikTok
        </a>
      </p>
    </section>
  );
}
