// Server component : récupère les goals publics de la chaîne via Twitch GraphQL,
// les rend en barres de progression. Si la requête échoue ou retourne rien, on n'affiche rien.

import { fetchTwitchGoals, type TwitchGoal } from "@/lib/twitch";
import SectionHeader from "./SectionHeader";

type GoalDisplay = {
  iconBg: string;
  iconColor: string;
  fillFrom: string;
  fillTo: string;
  Icon: () => JSX.Element;
};

const GOAL_DISPLAY: Record<string, GoalDisplay> = {
  FOLLOWERS: {
    iconBg: "bg-neon-pink/10",
    iconColor: "text-neon-pink",
    fillFrom: "from-neon-pink/80",
    fillTo: "to-neon-pink",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  SUBSCRIPTIONS: {
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    fillFrom: "from-red-500/80",
    fillTo: "to-red-500",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  NEW_SUBSCRIPTIONS: {
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    fillFrom: "from-red-500/80",
    fillTo: "to-red-500",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  BITS: {
    iconBg: "bg-[#9146FF]/15",
    iconColor: "text-[#bf94ff]",
    fillFrom: "from-[#9146FF]/80",
    fillTo: "to-[#9146FF]",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2L4 8v8l8 6 8-6V8l-8-6zm0 2.5L18 9v6l-6 4.5L6 15V9l6-4.5z" />
      </svg>
    ),
  },
  PLUS_LEVEL: {
    iconBg: "bg-neon-yellow/10",
    iconColor: "text-neon-yellow",
    fillFrom: "from-neon-yellow/80",
    fillTo: "to-neon-yellow",
    Icon: () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        className="h-5 w-5"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
};

const DEFAULT_DISPLAY: GoalDisplay = {
  iconBg: "bg-neon-blue/10",
  iconColor: "text-neon-blue",
  fillFrom: "from-neon-blue/80",
  fillTo: "to-neon-blue",
  Icon: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

function GoalRow({ goal }: { goal: TwitchGoal }) {
  const display = GOAL_DISPLAY[goal.type] ?? DEFAULT_DISPLAY;
  const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition hover:bg-white/[0.02] ${
        goal.achieved ? "opacity-70" : ""
      }`}
    >
      <div
        className={`grid place-items-center h-10 w-10 shrink-0 rounded-xl ${display.iconBg} ${display.iconColor}`}
      >
        <display.Icon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-white/90 truncate">
            {goal.description || goal.type}
          </div>
          {goal.achieved ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-[#bf94ff] shrink-0"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : null}
        </div>
        <div className="text-[12px] text-white/55 tabular-nums mt-0.5">
          {formatNumber(goal.current)} / {formatNumber(goal.target)}
        </div>
        <div className="mt-2 h-1 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${display.fillFrom} ${display.fillTo}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default async function TwitchGoals({ login }: { login: string }) {
  const goals = await fetchTwitchGoals(login);
  if (goals.length === 0) return null;
  return (
    <section className="mt-12">
      <SectionHeader
        eyebrow="Objectifs Twitch · live"
        title="Les goals d'Inès"
        dotColor="bg-[#9146FF]"
        className="mb-5"
      />
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-2 sm:p-3 space-y-1">
        {goals.map((g, i) => (
          <GoalRow key={`${g.type}-${i}`} goal={g} />
        ))}
      </div>
    </section>
  );
}
