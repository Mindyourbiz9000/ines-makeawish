// Bloc d'ouverture de /shop : pas de carte, pas de halo. Une déclaration
// typographique pure, à la SSENSE / Aimé Leon Dore. Le seul clin d'œil néon
// rose : la signature `#freeines` en Pacifico tout en bas du bloc.

export default function StatementBlock() {
  return (
    <section className="mt-12 animate-fade-up sm:mt-16">
      <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
        Collection 01 — Draft
      </p>
      <h1 className="mt-5 text-6xl font-medium leading-[0.95] tracking-[-0.04em] text-white sm:text-8xl">
        SLAY.
      </h1>
      <p className="mt-6 text-sm text-white/55 sm:text-base">
        Six pièces. Aucune en vente. Pour l&apos;instant.
      </p>
      <div className="mt-8 flex items-end justify-between border-b border-white/10 pb-4">
        <span className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          A drop in progress
        </span>
        <span className="neon-title text-base">#freeines</span>
      </div>
    </section>
  );
}
