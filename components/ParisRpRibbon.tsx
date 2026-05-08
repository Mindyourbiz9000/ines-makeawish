// Petit ruban or qui pointe vers /parisrp. Pensé pour vivre tout en haut de la page.

export default function ParisRpRibbon() {
  return (
    <a
      href="/parisrp"
      className="group flex min-h-[44px] items-center gap-3 rounded-2xl border border-amber-300/20 bg-gradient-to-r from-amber-300/[0.06] via-yellow-400/[0.04] to-transparent px-4 py-3 transition-colors hover:border-amber-300/40"
    >
      <span aria-hidden="true" className="text-base text-amber-300/80">
        ✨
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
        <span className="text-sm font-medium text-white/90">
          Découvrir Paris RP
        </span>
        <span className="hidden text-[11px] text-white/40 xs:inline">
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
        className="h-4 w-4 text-white/60 transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </a>
  );
}
