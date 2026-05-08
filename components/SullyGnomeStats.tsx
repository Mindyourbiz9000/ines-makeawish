// "La forme du moment" : layout asymétrique avec une grosse tuile hero (Pic
// viewers) + 4 tuiles compactes. La hero attire l'œil, les compactes posent
// le contexte.

import { getCachedSullyStats, type SullyPeriod } from "@/lib/sullygnome";
import SectionHeader from "./SectionHeader";
import { HeroStatTile, StatTile } from "./StatTile";
import {
  EyeIcon,
  UsersIcon,
  TrendingUpIcon,
  GamepadIcon,
  FlameIcon,
} from "./icons/StatIcons";

const PERIOD_LABEL: Record<SullyPeriod, string> = {
  7: "7 derniers jours",
  14: "14 derniers jours",
  30: "30 derniers jours",
  90: "90 derniers jours",
  365: "12 derniers mois",
};

function formatInt(n: number): string {
  return Math.round(n).toLocaleString("fr-FR");
}

function formatHours(n: number): string {
  // n = heures décimales (ex: 14.75). Affichage "14h 45min" / "4h" / "30min".
  const total = Math.round(n * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, "0")}min`;
}

function formatDelta(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${formatInt(Math.abs(n))}`;
}

export default async function SullyGnomeStats({
  login,
  period = 7,
}: {
  login: string;
  period?: SullyPeriod;
}) {
  const stats = await getCachedSullyStats(login, period);
  if (!stats) return null;

  // On a besoin du pic viewers pour la hero. Si c'est null, on fallback sur un
  // grid uniforme à 4 tuiles compactes.
  const hasHero = stats.peakViewers != null;

  return (
    <section className="mt-12">
      <SectionHeader
        eyebrow={PERIOD_LABEL[period]}
        title="La forme du moment"
        dotColor="bg-neon-blue"
        className="mb-5"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {hasHero ? (
          <div className="sm:col-span-2 md:col-span-2 md:row-span-2">
            <HeroStatTile
              accent="pink"
              icon={<EyeIcon className="h-full w-full" />}
              label="Pic viewers"
              value={formatInt(stats.peakViewers as number)}
              sub="Le moment fort de la semaine"
            />
          </div>
        ) : null}

        {stats.averageViewers != null ? (
          <StatTile
            accent="blue"
            icon={<UsersIcon className="h-full w-full" />}
            label="Viewers moyen"
            value={formatInt(stats.averageViewers)}
          />
        ) : null}

        {stats.followersGained != null ? (
          <StatTile
            accent={stats.followersGained >= 0 ? "green" : "pink"}
            icon={<TrendingUpIcon className="h-full w-full" />}
            label="Followers gagnés"
            value={formatDelta(stats.followersGained)}
          />
        ) : null}

        {stats.topGameByTime ? (
          <StatTile
            accent="yellow"
            icon={<GamepadIcon className="h-full w-full" />}
            label="Top jeu joué"
            value={stats.topGameByTime.name}
            sub={formatHours(stats.topGameByTime.hours)}
          />
        ) : null}

        {stats.topGameByViewers ? (
          <StatTile
            accent="purple"
            icon={<FlameIcon className="h-full w-full" />}
            label="Top jeu en viewers"
            value={stats.topGameByViewers.name}
            sub={`${formatInt(stats.topGameByViewers.viewers)} viewers en moyenne`}
          />
        ) : null}
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
