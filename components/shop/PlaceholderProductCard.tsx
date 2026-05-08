// Carte produit factice pour la /shop en mockup. Affiche image + titre + badge
// "BIENTÔT" + prix barré "—€". Au hover, overlay "Pas encore en vente" pour
// rappeler que rien n'est cliquable.

type Props = {
  title: string;
  image: string; // chemin dans /public/shop/placeholder/
  fallbackEmoji?: string; // affiché si l'image n'a pas (encore) été déposée
};

export default function PlaceholderProductCard({
  title,
  image,
  fallbackEmoji = "👕",
}: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 transition hover:ring-white/20">
      {/* Badge "Bientôt" */}
      <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-neon-pink/40 bg-neon-pink/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-neon-pink shadow-glow-pink backdrop-blur">
        Bientôt
      </div>

      {/* Image (avec emoji fallback derrière si l'image manque) */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-night-700 to-night-900">
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center text-6xl text-white/10"
        >
          {fallbackEmoji}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-50"
          loading="lazy"
        />
        {/* Overlay au hover : message "pas encore en vente" */}
        <div className="absolute inset-0 grid place-items-center bg-night-900/50 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 sm:text-xs">
            Pas encore en vente
          </span>
        </div>
      </div>

      {/* Footer : titre + prix barré */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm tabular-nums text-white/40 line-through">
          — €
        </p>
      </div>
    </div>
  );
}
