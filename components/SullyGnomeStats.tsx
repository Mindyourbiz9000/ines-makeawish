// Stats agrégées sur N jours scrapées depuis sullygnome.com.
// Renvoie null si le scraping rate (Cloudflare, HTML changé, etc.).

import { fetchSullyGnomeStats, type SullyPeriod } from "@/lib/sullygnome";
import SectionHeader from "./SectionHeader";

const PERIOD_LABEL: Record<SullyPeriod, string> = {
  7: "7 derniers jours",
  14: "14 derniers jours",
  30: "30 derniers jours",
  90: "90 derniers jours",
  365: "12 derniers mois",
};

export default async function SullyGnomeStats({
  login,
  period = 7,
}: {
  login: string;
  period?: SullyPeriod;
}) {
  const stats = await fetchSullyGnomeStats(login, period);
  if (!stats) return null;

  const tiles: { value: string; label: string }[] = [];
  if (stats.hoursWatched)
    tiles.push({ value: stats.hoursWatched, label: "Heures vues" });
  if (stats.hoursStreamed)
    tiles.push({ value: stats.hoursStreamed, label: "Heures streamées" });
  if (stats.averageViewers)
    tiles.push({ value: stats.averageViewers, label: "Viewers moyen" });
  if (stats.peakViewers)
    tiles.push({ value: stats.peakViewers, label: "Pic viewers" });
  if (stats.streamsCount)
    tiles.push({ value: stats.streamsCount, label: "Streams" });
  if (stats.followersGained)
    tiles.push({ value: stats.followersGained, label: "Followers gagnés" });

  if (tiles.length === 0) return null;

  return (
    <section className="mt-12">
      <SectionHeader
        eyebrow={PERIOD_LABEL[period]}
        title="La forme du moment"
        dotColor="bg-neon-blue"
        className="mb-5"
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className="flex min-h-[88px] flex-col justify-between rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10"
          >
            <p className="text-2xl font-semibold tabular-nums text-white">
              {tile.value}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
              {tile.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-white/35">
        Source :{" "}
        <a
          href={`https://sullygnome.com/channel/${login}/${period}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/60 hover:decoration-white/50"
        >
          sullygnome.com
        </a>
      </p>
    </section>
  );
}
