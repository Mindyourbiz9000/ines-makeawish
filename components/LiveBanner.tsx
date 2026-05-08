// Carte "Twitch Now" qui s'adapte au statut live d'Inès. 100% IVR.fi, plus de GraphQL.
//
// - En live : carte rouge animée avec thumbnail + viewers + titre + catégorie + CTA Twitch.
// - Offline : carte neutre avec le titre du dernier broadcast + catégorie + CTA "Voir les replays".
// - Si aucune info de last broadcast non plus, on affiche au moins un cadre minimal qui pointe
//   vers Twitch — pas de fake data, pas de section vide non plus.

import type { TwitchLiveState } from "@/lib/twitch";

const TWITCH_CHANNEL_URL = "https://www.twitch.tv/inespnj";
const TWITCH_VIDEOS_URL =
  "https://www.twitch.tv/inespnj/videos?filter=archives";

function formatViewers(n: number): string {
  return n.toLocaleString("fr-FR");
}

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `il y a ${weeks} sem.`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

function thumb(url: string | null, width = 360, height = 200): string | null {
  if (!url) return null;
  return url
    .replace("{width}", String(width))
    .replace("{height}", String(height));
}

export default function LiveBanner({ live }: { live: TwitchLiveState }) {
  if (live.isLive && live.stream) {
    const thumbUrl = thumb(live.stream.thumbnailUrl, 640, 360);
    return (
      <section className="mt-6 sm:mt-8 rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/[0.10] via-[#9146FF]/[0.06] to-transparent backdrop-blur-xl px-5 py-5 sm:px-6 sm:py-6 shadow-[0_0_50px_-12px_rgba(239,68,68,0.45)]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="font-semibold text-red-300">EN DIRECT</span>
          <span className="text-white/30">·</span>
          <span className="text-xs normal-case tracking-normal tabular-nums text-white/70">
            {formatViewers(live.stream.viewerCount)} spectateurs
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="w-full sm:w-[180px] aspect-video shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 bg-night-900">
            {thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbUrl}
                alt={`Aperçu du stream ${live.stream.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-3xl text-white/30">
                📺
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold leading-snug text-white line-clamp-2">
              {live.stream.title}
            </h3>
            {live.stream.game ? (
              <div className="mt-1.5 inline-flex items-center gap-2 text-[12px] text-white/55">
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span>{live.stream.game}</span>
              </div>
            ) : null}
            <a
              href={TWITCH_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#9146FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7a36e6]"
            >
              Regarder sur Twitch
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Offline state — IVR's lastBroadcast (no thumbnail, no view count, no length).
  // On affiche ce qu'on a + lien vers la liste des replays.
  if (!live.lastBroadcast?.title) return null;

  const banner = thumb(live.offlineImageUrl, 640, 360);
  return (
    <section className="mt-6 sm:mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
        <span className="h-2 w-2 rounded-full bg-white/30" />
        <span className="text-white/55">Dernier stream</span>
        {live.lastBroadcast.startedAt ? (
          <>
            <span className="text-white/20">·</span>
            <span className="text-xs normal-case tracking-normal text-white/45">
              {formatRelative(live.lastBroadcast.startedAt)}
            </span>
          </>
        ) : null}
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="w-full sm:w-[180px] aspect-video shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 bg-night-900">
          {banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner}
              alt={`Bannière offline d'InesPNJ`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-3xl text-white/30">
              📼
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold leading-snug text-white line-clamp-2">
            {live.lastBroadcast.title}
          </h3>
          {live.lastBroadcast.game ? (
            <div className="mt-1.5 inline-flex items-center gap-2 text-[12px] text-white/55">
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>{live.lastBroadcast.game}</span>
            </div>
          ) : null}
          <a
            href={TWITCH_VIDEOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white/90 transition-colors hover:bg-white/[0.10]"
          >
            Voir les replays
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
