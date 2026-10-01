// Le setup d'Inès, en fiche technique.

type GearItem = { label: string; value: string };

const GEAR: GearItem[] = [
  { label: "Caméra", value: "OBSBOT Tiny 2 Lite" },
  { label: "Clavier", value: "YUNZII B87" },
  { label: "Micro", value: "Shure SM7B" },
  { label: "Casque", value: "Beyerdynamic DT 770 PRO" },
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
    <div className="rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-night-600/70 to-night-800/70 p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-heading text-2xl font-extrabold">Le setup</h3>
        <span className="text-[13px] font-medium text-neon-yellow">
          {GEAR.length} pièces
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2.5">
        {GEAR.map((item) => (
          <li
            key={item.label}
            className="rounded-2xl border border-white/[0.06] bg-night-900/55 px-4 py-3.5"
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/60 sm:text-xs">
              {item.label}
            </p>
            <p className="mt-1.5 text-sm font-medium leading-snug sm:text-[15px]">
              {item.value}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
