// Bloc d'ouverture éditorial de /shop. Type SSENSE / Aimé Leon Dore : pas de
// carte, pas de halo. Une simple déclaration typographique. Le seul clin
// d'œil néon rose : la signature `#freeines` en Pacifico tout en bas.

export default function StatementBlock() {
  return (
    <section className="mt-12 animate-fade-up sm:mt-16">
      <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
        Boutique officielle
      </p>
      <h1 className="mt-5 text-6xl font-medium leading-[0.95] tracking-[-0.04em] text-white sm:text-8xl">
        SLAY.
      </h1>
      <p className="mt-6 text-sm text-white/55 sm:text-base">
        Le merch officiel d&apos;InesPNJ. Édition limitée, expédié depuis la France.
      </p>
      <div className="mt-8 flex items-end justify-between border-b border-white/10 pb-4">
        <span className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          Drop en cours
        </span>
        <span className="neon-title text-base">#freeines</span>
      </div>
    </section>
  );
}
