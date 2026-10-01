// "La chaîne" : carte live (ou dernier live) + tuiles de stats, en bento.
// 100% IVR.fi via lib/twitch.ts. Les tuiles sans donnée ne s'affichent pas.

import type { TwitchLiveState } from "@/lib/twitch";

const TWITCH_CHANNEL_URL = "https://www.twitch.tv/inespnj";
const TWITCH_VIDEOS_URL = "https://www.twitch.tv/inespnj/videos?filter=archives";

function formatRelative(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const days = Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `il y a ${weeks} sem.`;
  return `il y a ${Math.floor(days / 30)} mois`;
}

function formatYear(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).getFullYear().toString();
}

function formatStatus(roles: TwitchLiveState["roles"]): string | null {
  if (roles.isPartner) return "Partenaire";
  if (roles.isAffiliate) return "Affilié";
  return null;
}

function thumb(url: string | null, width: number, height: number): string | null {
  if (!url) return null;
  return url.replace("{width}", String(width)).replace("{height}", String(height));
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}

function LiveCard({ live }: { live: TwitchLiveState }) {
  const stream = live.isLive ? live.stream : null;
  const last = live.lastBroadcast;

  let badge: React.ReactNode;
  let category: string | null = null;
  let title: string;
  let cta: { href: string; label: string };
  let meta: string | null = null;
  let background: string | null = null;

  if (stream) {
    badge = (
      <span className="inline-flex items-center gap-2 rounded-full bg-neon-pink px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-night-900 sm:text-[13px]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-night-900 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-night-900" />
        </span>
        En live maintenant
      </span>
    );
    category = stream.game;
    title = stream.title || "Inès est en live";
    cta = { href: TWITCH_CHANNEL_URL, label: "Rejoindre le live" };
    meta = `${stream.viewerCount.toLocaleString("fr-FR")} spectateurs`;
    background = thumb(stream.thumbnailUrl, 960, 540);
  } else if (last?.title) {
    badge = (
      <span className="inline-flex items-center rounded-full bg-white/[0.08] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-white/80 sm:text-[13px]">
        Dernier live
      </span>
    );
    category = last.game;
    title = last.title;
    cta = { href: TWITCH_VIDEOS_URL, label: "Revoir le replay" };
    meta = formatRelative(last.startedAt);
    background = thumb(live.offlineImageUrl, 960, 540);
  } else {
    badge = (
      <span className="inline-flex items-center rounded-full bg-white/[0.08] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-white/80 sm:text-[13px]">
        Hors ligne
      </span>
    );
    title = "Retrouve Inès sur Twitch";
    cta = { href: TWITCH_CHANNEL_URL, label: "Suivre sur Twitch" };
  }

  return (
    <article
      id="live"
      className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[26px] border border-white/[0.08] bg-gradient-to-br from-night-600 to-night-800 p-5 sm:rounded-[28px] sm:p-7 lg:col-span-7 lg:row-span-2 lg:min-h-[380px]"
    >
      {background ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={background}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_85%_5%,rgba(255,58,166,0.3),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-night-900/90 via-night-900/40 to-transparent"
      />

      <div className="relative flex items-center justify-between gap-3">
        {badge}
        <span className="hidden text-[13px] text-white/60 sm:inline">twitch.tv/inespnj</span>
      </div>

      <div className="relative mt-10">
        {category ? (
          <p className="text-[13px] font-medium text-neon-blue sm:text-sm">{category}</p>
        ) : null}
        <h3 className="mt-2 line-clamp-3 max-w-xl font-heading text-[26px] font-extrabold leading-[1.1] sm:text-[34px]">
          {title}
        </h3>
        <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6">
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-night-900 transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            {cta.label}
          </a>
          {meta ? <span className="text-sm text-white/65">{meta}</span> : null}
        </div>
      </div>
    </article>
  );
}

export default function ChannelSection({ live }: { live: TwitchLiveState }) {
  const followers = live.followers > 0 ? live.followers.toLocaleString("fr-FR") : null;
  const year = formatYear(live.createdAt);
  const status = formatStatus(live.roles);
  const hasSmallTiles = year != null || status != null;

  return (
    <section id="stats" className="scroll-mt-28 pb-12 sm:pb-28">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#ff9ed1] sm:text-[13px]">
        La chaîne
      </p>
      <h2 className="mb-5 mt-2 font-heading text-[32px] font-extrabold leading-none tracking-[-0.02em] sm:mb-7 sm:mt-2.5 sm:text-5xl">
        En direct &amp; en chiffres
      </h2>

      <div className="grid gap-2.5 sm:gap-4 lg:grid-cols-12">
        <LiveCard live={live} />

        {followers ? (
          <article
            className={`flex flex-col justify-between gap-3.5 rounded-[22px] bg-neon-pink p-5 text-night-900 sm:min-h-[182px] sm:rounded-[28px] sm:p-6 lg:col-span-5 ${
              hasSmallTiles ? "" : "lg:row-span-2"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold sm:text-sm">Followers</span>
              <UsersIcon className="h-[22px] w-[22px]" />
            </div>
            <span className="font-heading text-5xl font-extrabold leading-none tracking-[-0.03em] tabular-nums sm:text-[64px]">
              {followers}
            </span>
          </article>
        ) : null}

        {hasSmallTiles ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:col-span-5">
            {year ? (
              <article className="flex flex-col justify-between gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-[18px] sm:rounded-3xl sm:p-[22px]">
                <span className="text-xs text-white/70 sm:text-[13px]">Compte créé en</span>
                <span className="font-heading text-[30px] font-extrabold leading-none text-neon-blue sm:text-[40px]">
                  {year}
                </span>
              </article>
            ) : null}
            {status ? (
              <article className="flex flex-col justify-between gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-[18px] sm:rounded-3xl sm:p-[22px]">
                <span className="text-xs text-white/70 sm:text-[13px]">Statut</span>
                <span className="font-heading text-2xl font-extrabold leading-none text-neon-yellow sm:text-[32px]">
                  {status}
                </span>
              </article>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
