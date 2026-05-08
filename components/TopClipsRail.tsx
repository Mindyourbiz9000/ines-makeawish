// Server component : rail horizontal scrollable des top clips Twitch.
// Rendue null si on n'a aucun clip.

import { fetchTopClips } from "@/lib/twitch";
import SectionHeader from "./SectionHeader";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatViews(n: number): string {
  if (n >= 1000) {
    const k = (n / 1000).toFixed(n >= 10000 ? 0 : 1);
    return `${k.replace(".", ",")}k vues`;
  }
  return `${n} vues`;
}

export default async function TopClipsRail({
  login,
}: {
  login: string;
}) {
  const clips = await fetchTopClips(login, 6);
  if (clips.length === 0) return null;
  return (
    <section className="mt-12">
      <SectionHeader
        eyebrow="Top moments"
        title="Les meilleurs clips"
        dotColor="bg-neon-pink"
        className="mb-5"
      />
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {clips.map((clip) => (
          <a
            key={clip.slug}
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group snap-start shrink-0 w-[78%] sm:w-[42%] md:w-[31%]"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-night-700 to-night-900 ring-1 ring-white/10 transition group-hover:ring-neon-pink/50">
              {clip.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white/85 backdrop-blur tabular-nums">
                {formatDuration(clip.durationSeconds)}
              </span>
            </div>
            <h3 className="mt-2 text-sm font-medium leading-snug text-white/90 line-clamp-2">
              {clip.title}
            </h3>
            <p className="mt-0.5 text-[11px] tabular-nums text-white/45">
              {formatViews(clip.viewCount)}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
