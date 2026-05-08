// Colophon de la /shop : 3e signal "mockup" du design distribué de Sarg.
// Pas de carte, pas d'icône — juste une fine print éditoriale séparée du
// reste par une hairline rule.

export default function Colophon() {
  return (
    <section className="mt-24 border-t border-white/[0.08] pt-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
        Colophon — not for sale
      </p>
      <p className="mt-3 max-w-md text-[11px] leading-relaxed text-white/40">
        Cette page est un aperçu. Aucun produit n&apos;est commercialisé. Les
        visuels, prix et descriptions sont indicatifs et susceptibles
        d&apos;évoluer.
      </p>
    </section>
  );
}
