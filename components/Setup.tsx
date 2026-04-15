// Petit composant déroulant présentant le setup d'Ines.
// Utilise <details>/<summary> natifs — aucun JS requis.

type GearItem = { label: string; value: string };

const GEAR: GearItem[] = [
  { label: "Caméra", value: "OBSBOT Tiny 2 Lite" },
  { label: "Clavier", value: "YUNZII B87" },
  { label: "Micro", value: "Shure MV6" },
  { label: "Carte mère", value: "MSI MPG B550 Gaming Plus" },
  { label: "Processeur", value: "AMD Ryzen 7 5800X" },
  {
    label: "Alimentation",
    value: "CORSAIR CX750 ATX 750W 80 Plus Bronze",
  },
  { label: "RAM", value: "CORSAIR Vengeance RGB Pro 32 Go" },
  {
    label: "Carte graphique",
    value: "GeForce RTX 4060 Twin Edge OC White Edition",
  },
  { label: "SSD", value: "Kingston NV3 1 To" },
  { label: "Watercooling", value: "MSI MAG CoreLiquid A13 240 White" },
  { label: "Boîtier", value: "MSI MAG Forge 320R Airflow" },
];

export default function Setup() {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur open:border-neon-blue/40 open:shadow-glow">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-white sm:text-base">
        <span className="flex items-center gap-2">
          <span aria-hidden="true">🖥️</span>
          <span>See my setup</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <ul className="divide-y divide-white/10 border-t border-white/10 px-5 py-3 text-sm">
        {GEAR.map((item) => (
          <li
            key={item.label}
            className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:gap-3"
          >
            <span className="shrink-0 text-[11px] uppercase tracking-[0.25em] text-neon-blue/80 sm:w-40">
              {item.label}
            </span>
            <span className="text-white/90">{item.value}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
