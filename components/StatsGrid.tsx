// Tuiles de stats publiques : 100% IVR.fi (créationCompte, followers, dernière catégorie, statut).
// Pas de fake data — chaque tuile n'apparaît que si on a la vraie valeur.

import type { TwitchLiveState } from "@/lib/twitch";
import SectionHeader from "./SectionHeader";

function formatYear(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).getFullYear().toString();
}

function formatFollowers(n: number | null): string | null {
  if (n == null || n <= 0) return null;
  return n.toLocaleString("fr-FR");
}

function formatStatus(roles: TwitchLiveState["roles"]): string | null {
  if (roles.isPartner) return "Partenaire";
  if (roles.isAffiliate) return "Affilié";
  return null;
}

export default function StatsGrid({ live }: { live: TwitchLiveState }) {
  const tiles: { value: string; label: string }[] = [];

  const year = formatYear(live.createdAt);
  if (year) tiles.push({ value: year, label: "Membre depuis" });

  const followers = formatFollowers(live.followers);
  if (followers) tiles.push({ value: followers, label: "Followers" });

  if (live.lastBroadcast?.game) {
    tiles.push({ value: live.lastBroadcast.game, label: "Dernière catégorie" });
  }

  const status = formatStatus(live.roles);
  if (status) tiles.push({ value: status, label: "Statut" });

  // Pas de vraies données → on ne rend rien (jamais de section vide ou inventée).
  if (tiles.length === 0) return null;

  return (
    <section className="mt-12">
      <SectionHeader
        eyebrow="Stats"
        title="La chaîne en chiffres"
        dotColor="bg-neon-yellow"
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
    </section>
  );
}
