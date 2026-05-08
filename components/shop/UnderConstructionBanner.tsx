// Bandeau hero de la page /shop : annonce que la boutique est en construction.
// Triple messaging : eyebrow "Aperçu · Mockup", gros titre, sous-titre éditorial,
// disclaimer italique. Conçu pour qu'aucun visiteur ne puisse penser que c'est réel.

export default function UnderConstructionBanner() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-neon-pink/30 bg-gradient-to-b from-neon-pink/[0.10] via-white/[0.02] to-transparent px-6 py-10 text-center backdrop-blur-xl shadow-[0_0_60px_-20px_rgba(255,58,166,0.55)] sm:px-12 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-aurora"
      />
      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-neon-pink/80 sm:text-xs">
          🚧 Aperçu · Mockup · 🚧
        </p>
        <h1
          className="neon-title mt-4 leading-[0.9]"
          style={{ fontSize: "clamp(2.25rem, 9vw, 4rem)" }}
        >
          Boutique en construction
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm text-white/65 sm:text-base">
          Le merch officiel #freeines arrive bientôt.
        </p>
        <p className="mx-auto mt-3 max-w-md text-[12px] italic text-white/45 sm:text-sm">
          Tu peux faire défiler la boutique pour avoir un avant-goût, mais
          aucun produit n&apos;est réellement disponible à l&apos;achat.
        </p>
      </div>
    </section>
  );
}
