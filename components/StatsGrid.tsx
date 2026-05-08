// Server component : grille 2x2 (mobile) / 4-up (desktop) de stats publiques de la chaîne.
// Membre depuis · heures streamées · clips · top catégorie. Tous optionnels.

import { fetchChannelStats } from "@/lib/twitch";

function formatYear(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).getFullYear().toString();
}

// Valeurs fallback : connues stables / approximatives. Affichées si la
// requête GraphQL renvoie null. Année de création basée sur l'historique
// Twitch publique d'Inès, top catégorie sur ses streams habituels.
const FALLBACK_YEAR = "2018";
const FALLBACK_TOP_CATEGORY = "Grand Theft Auto V";

export default async function StatsGrid({ login }: { login: string }) {
  const stats = await fetchChannelStats(login);
  const year = formatYear(stats.createdAt) ?? FALLBACK_YEAR;
  const topCategory = stats.topCategory ?? FALLBACK_TOP_CATEGORY;

  const tiles: { value: string; label: string; sub?: string }[] = [
    { value: year, label: "Membre depuis" },
  ];
  if (stats.totalHours != null && stats.totalHours > 0) {
    tiles.push({
      value: stats.totalHours.toLocaleString("fr-FR"),
      label: "Heures streamées",
      sub: " h",
    });
  }
  if (stats.totalClips != null && stats.totalClips > 0) {
    tiles.push({
      value: stats.totalClips.toLocaleString("fr-FR"),
      label: "Clips",
    });
  }
  tiles.push({ value: topCategory, label: "Top catégorie" });

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((tile, i) => (
        <div
          key={i}
          className="flex min-h-[88px] flex-col justify-between rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10"
        >
          <p className="text-2xl font-semibold tabular-nums text-white">
            {tile.value}
            {tile.sub ? (
              <span className="text-base text-white/55">{tile.sub}</span>
            ) : null}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
            {tile.label}
          </p>
        </div>
      ))}
    </div>
  );
}
