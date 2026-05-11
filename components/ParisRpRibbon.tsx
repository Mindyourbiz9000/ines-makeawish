// Petit ruban néon vers /parisrp. Compact mais coloré — gradient pink/yellow
// pour bien capter l'œil sans prendre toute la largeur.

export default function ParisRpRibbon() {
  return (
    <a
      href="/parisrp"
      className="group relative flex min-h-[44px] items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-neon-pink/30 via-neon-pink/15 to-neon-yellow/25 px-4 py-2.5 ring-1 ring-neon-pink/40 transition-all hover:ring-neon-pink/70"
    >
      <span
        aria-hidden="true"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neon-pink/30 text-base ring-1 ring-neon-pink/50"
      >
        ✨
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
        <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white">
          Paris RP
        </span>
        <span className="hidden text-[11px] text-white/80 xs:inline">
          · Le serveur GTA RP où Inès roleplay
        </span>
      </div>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 text-white transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </a>
  );
}
