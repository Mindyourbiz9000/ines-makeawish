// Server component : fetch le flux RSS.app (JSON Feed 1.1) et affiche
// les 3 derniers TikToks d'@inespnj. Cache 1h côté Vercel via ISR.

type JsonFeedItem = {
  id?: string;
  url?: string;
  external_url?: string;
  title?: string;
};

type JsonFeed = {
  items?: JsonFeedItem[];
};

const FEED_URL = "https://rss.app/feeds/v1.1/8DhlPr0ieIAeg7cV.json";
const REVALIDATE_SECONDS = 3600;

function extractVideoId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

async function fetchLatestVideoIds(): Promise<string[]> {
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as JsonFeed;
    const ids: string[] = [];
    for (const item of data.items ?? []) {
      const id =
        extractVideoId(item.url) ??
        extractVideoId(item.external_url) ??
        extractVideoId(item.id);
      if (id && !ids.includes(id)) {
        ids.push(id);
        if (ids.length === 3) break;
      }
    }
    return ids;
  } catch {
    return [];
  }
}

export default async function TikTokReels() {
  const ids = await fetchLatestVideoIds();
  if (ids.length === 0) return null;

  return (
    <section className="mt-10">
      <p className="mb-5 text-center text-[10px] uppercase tracking-[0.3em] text-white/50 sm:text-xs">
        Mes derniers TikToks
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ids.map((id) => (
          <div
            key={id}
            className="aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-black/40"
          >
            <iframe
              src={`https://www.tiktok.com/embed/v2/${id}`}
              className="h-full w-full"
              allow="encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              title={`TikTok video ${id}`}
              loading="lazy"
            />
          </div>
        ))}
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
