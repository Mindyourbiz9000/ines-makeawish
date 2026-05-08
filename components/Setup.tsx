// Liste du setup d'Inès. Plus de <details> wrapper — c'est intégré dans <AboutTabs>.

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
    <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
      {GEAR.map((item) => (
        <li key={item.label} className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            {item.label}
          </span>
          <span className="text-[15px] text-white/95">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
