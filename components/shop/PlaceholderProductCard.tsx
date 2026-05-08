"use client";

import { useState } from "react";

// Carte produit éditoriale 4:5 portrait. Pas de chrome de carte (pas de fond,
// pas de bordure de carte) — l'image EST la carte, ring discret comme seul
// liseré. Si l'image est manquante (PNG pas encore déposé), un gros numéro
// fadé sert de fallback à la place d'un emoji enfantin.
//
// Hover : ring qui s'éclaircit, image qui zoom subtilement (700ms ease-out)
// et la ligne de code typographique qui s'éclaircit aussi. Aucun overlay
// criard "pas en vente" — la mention "À VENIR" sous l'image suffit.

type Props = {
  code: string;        // ex. "TEE · N°01"
  name: string;        // ex. "SLAY"
  index: number;       // 1-6, pour le fallback typographique
  imageSrc: string;    // chemin /public
};

export default function PlaceholderProductCard({
  code,
  name,
  index,
  imageSrc,
}: Props) {
  const [imageOk, setImageOk] = useState(true);
  const fallbackNumber = String(index).padStart(2, "0");

  return (
    <article className="group">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-md bg-white/[0.025] ring-1 ring-white/[0.06] transition-[box-shadow,_outline-color] duration-500 ease-out group-hover:ring-white/20"
        role="presentation"
      >
        {/* Big-number fallback : visible quand l'image n'a pas (encore) été déposée. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 grid select-none place-items-center text-[110px] font-medium leading-none tracking-[-0.06em] text-white/[0.07] sm:text-[140px]"
        >
          {fallbackNumber}
        </span>

        {/* Image — masquée si onError pour révéler le fallback */}
        {imageOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={`${code} · ${name}`}
            loading="lazy"
            onError={() => setImageOk(false)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : null}

        {/* Mockup mark : dot rose + label minuscule. Pas de pill, pas de fond. */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full bg-neon-pink"
          />
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/70">
            Mockup
          </span>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45 transition-colors duration-500 group-hover:text-white/75">
          {code}
        </p>
        <p className="mt-1 text-sm font-medium text-white">{name}</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/35">
          À venir
        </p>
      </div>
    </article>
  );
}
