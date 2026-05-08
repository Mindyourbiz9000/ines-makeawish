// Tuiles IVR : followers / année compte / statut. 3 tuiles compactes avec icônes.

import type { TwitchLiveState } from "@/lib/twitch";
import SectionHeader from "./SectionHeader";
import { StatTile } from "./StatTile";
import {
  CalendarIcon,
  HeartIcon,
  VerifiedIcon,
  GamepadIcon,
} from "./icons/StatIcons";

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

function gridColsClass(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-3";
    default:
      return "grid-cols-2 md:grid-cols-4";
  }
}

export default function StatsGrid({ live }: { live: TwitchLiveState }) {
  const tiles: React.ReactNode[] = [];

  const followers = formatFollowers(live.followers);
  if (followers) {
    tiles.push(
      <StatTile
        key="followers"
        icon={<HeartIcon className="h-full w-full" />}
        label="Followers"
        value={followers}
        accent="pink"
      />
    );
  }

  const year = formatYear(live.createdAt);
  if (year) {
    tiles.push(
      <StatTile
        key="created"
        icon={<CalendarIcon className="h-full w-full" />}
        label="Compte créé en"
        value={year}
        accent="blue"
      />
    );
  }

  const status = formatStatus(live.roles);
  if (status) {
    tiles.push(
      <StatTile
        key="status"
        icon={<VerifiedIcon className="h-full w-full" />}
        label="Statut"
        value={status}
        accent="purple"
      />
    );
  }

  if (live.lastBroadcast?.game) {
    tiles.push(
      <StatTile
        key="last-game"
        icon={<GamepadIcon className="h-full w-full" />}
        label="Dernière catégorie"
        value={live.lastBroadcast.game}
        accent="yellow"
      />
    );
  }

  if (tiles.length === 0) return null;

  return (
    <section className="mt-12">
      <SectionHeader
        eyebrow="Stats"
        title="La chaîne en chiffres"
        dotColor="bg-neon-yellow"
        className="mb-5"
      />
      <div className={`grid gap-3 ${gridColsClass(tiles.length)}`}>
        {tiles}
      </div>
    </section>
  );
}
