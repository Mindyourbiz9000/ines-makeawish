// Tuile de statistique réutilisable avec deux variantes : `hero` (grosse,
// avec icône en fond + halo) et `compact` (petite, avec badge icône à gauche).
// Chaque tuile a un accent couleur (pink / blue / yellow / purple / green / cyan)
// qui pilote l'icône, le gradient de fond, et la lueur.

import type { ReactNode } from "react";

type Accent = "pink" | "blue" | "yellow" | "purple" | "green" | "cyan";
type Variant = "compact" | "hero";

const ACCENTS: Record<
  Accent,
  {
    text: string;
    iconBg: string;
    heroGradient: string;
    heroGlow: string;
  }
> = {
  pink: {
    text: "text-neon-pink",
    iconBg: "bg-neon-pink/15",
    heroGradient: "from-neon-pink/[0.18] via-neon-pink/[0.04] to-transparent",
    heroGlow: "shadow-[0_0_60px_-15px_rgba(255,58,166,0.55)]",
  },
  blue: {
    text: "text-neon-blue",
    iconBg: "bg-neon-blue/15",
    heroGradient: "from-neon-blue/[0.18] via-neon-blue/[0.04] to-transparent",
    heroGlow: "shadow-[0_0_60px_-15px_rgba(74,214,255,0.55)]",
  },
  yellow: {
    text: "text-neon-yellow",
    iconBg: "bg-neon-yellow/15",
    heroGradient: "from-neon-yellow/[0.18] via-neon-yellow/[0.04] to-transparent",
    heroGlow: "shadow-[0_0_60px_-15px_rgba(255,216,74,0.55)]",
  },
  purple: {
    text: "text-[#bf94ff]",
    iconBg: "bg-[#9146FF]/15",
    heroGradient: "from-[#9146FF]/[0.18] via-[#9146FF]/[0.04] to-transparent",
    heroGlow: "shadow-[0_0_60px_-15px_rgba(145,70,255,0.55)]",
  },
  green: {
    text: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    heroGradient: "from-emerald-500/[0.18] via-emerald-500/[0.04] to-transparent",
    heroGlow: "shadow-[0_0_60px_-15px_rgba(52,211,153,0.5)]",
  },
  cyan: {
    text: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    heroGradient: "from-cyan-500/[0.18] via-cyan-500/[0.04] to-transparent",
    heroGlow: "shadow-[0_0_60px_-15px_rgba(34,211,238,0.5)]",
  },
};

type CommonProps = {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: Accent;
};

export function StatTile({
  icon,
  label,
  value,
  sub,
  accent = "blue",
}: CommonProps) {
  const a = ACCENTS[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/[0.05] sm:p-5">
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent`}
      />
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${a.iconBg} ${a.text}`}
        >
          <span className="h-5 w-5">{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45 sm:text-[11px]">
            {label}
          </p>
          <p className="line-clamp-2 text-base font-semibold leading-tight text-white sm:text-lg">
            {value}
          </p>
          {sub ? (
            <p className="mt-0.5 text-[11px] tabular-nums text-white/50">
              {sub}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type HeroProps = CommonProps & {
  accent?: Accent;
  trailing?: ReactNode;
};

export function HeroStatTile({
  icon,
  label,
  value,
  sub,
  accent = "pink",
  trailing,
}: HeroProps) {
  const a = ACCENTS[accent];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${a.heroGradient} bg-white/[0.02] p-6 ring-1 ring-white/10 ${a.heroGlow} sm:p-7`}
    >
      {/* Icône en gros, en filigrane dans le coin */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-4 -bottom-4 h-32 w-32 ${a.text} opacity-[0.08]`}
      >
        {icon}
      </div>
      <div className="relative flex h-full flex-col">
        <div
          className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] ${a.text}`}
        >
          <span className={`grid h-7 w-7 place-items-center rounded-lg ${a.iconBg}`}>
            <span className="h-3.5 w-3.5">{icon}</span>
          </span>
          <span>{label}</span>
        </div>
        <p className="mt-5 text-5xl font-semibold tabular-nums leading-none text-white sm:text-6xl">
          {value}
        </p>
        {sub ? (
          <p className="mt-3 text-[13px] text-white/60 sm:text-sm">{sub}</p>
        ) : null}
        {trailing ? <div className="mt-auto pt-4">{trailing}</div> : null}
      </div>
    </div>
  );
}
