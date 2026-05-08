// Stats agrégées sur N jours via les endpoints JSON Highcharts de sullygnome.com.
// Renvoie null si les requêtes échouent (Cloudflare, network, schema changé).

import { getCachedSullyStats, type SullyPeriod } from "@/lib/sullygnome";
import SectionHeader from "./SectionHeader";

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
  // SullyGnome renvoie déjà la valeur en heures pour gamestreamedtime.
  // On affiche avec 1 décimale si < 10h, sinon entier.
  if (n < 10) return `${n.toFixed(1)} h`;
  return `${Math.round(n).toLocaleString("fr-FR")} h`;
}

function formatDelta(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${formatInt(Math.abs(n))}`;
}

function gridColsClass(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-3";
    case 4:
      return "grid-cols-2 md:grid-cols-4";
    case 5:
      // 2 cols mobile (2+2+1), 3 cols medium (3+2 propre), 5 cols large.
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    default:
      return "grid-cols-2 md:grid-cols-4";
  }
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

  // 5 tuiles, ordre = priorité éditoriale (designer + analyst) :
  // 1. Pic viewers       — moment fort de la semaine
  // 2. Viewers moyen     — santé générale
  // 3. Followers gagnés  — signal de croissance
  // 4. Top jeu joué      — sur quoi elle a passé le plus de temps
  // 5. Top jeu en viewers — ce qui marche le mieux
  const tiles: { value: string; label: string; sub?: string }[] = [];

  if (stats.peakViewers != null) {
    tiles.push({
      value: formatInt(stats.peakViewers),
      label: "Pic viewers",
    });
  }
  if (stats.averageViewers != null) {
    tiles.push({
      value: formatInt(stats.averageViewers),
      label: "Viewers moyen",
    });
  }
  if (stats.followersGained != null) {
    tiles.push({
      value: formatDelta(stats.followersGained),
      label: "Followers gagnés",
    });
  }
  if (stats.topGameByTime) {
    tiles.push({
      value: stats.topGameByTime.name,
      label: "Top jeu joué",
      sub: formatHours(stats.topGameByTime.hours),
    });
  }
  if (stats.topGameByViewers) {
    tiles.push({
      value: stats.topGameByViewers.name,
      label: "Top jeu en viewers",
      sub: `${formatInt(stats.topGameByViewers.viewers)} viewers`,
    });
  }

  if (tiles.length === 0) return null;

  return (
    <section className="mt-12">
      <SectionHeader
        eyebrow={PERIOD_LABEL[period]}
        title="La forme du moment"
        dotColor="bg-neon-blue"
        className="mb-5"
      />
      <div className={`grid gap-3 ${gridColsClass(tiles.length)}`}>
        {tiles.map((tile, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10"
          >
            <p className="truncate text-xl font-semibold tabular-nums text-white sm:text-2xl">
              {tile.value}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-white/45">
              {tile.label}
              {tile.sub ? (
                <span className="ml-1.5 normal-case tracking-normal text-white/40">
                  · {tile.sub}
                </span>
              ) : null}
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
