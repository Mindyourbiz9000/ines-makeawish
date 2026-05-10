"use client";

// Carte produit éditoriale 4:5 portrait. Maintenant cliquable (vers la page
// détail produit) — gardée comme client component pour le onError de l'image
// (fallback grand numéro) et l'animation de hover.

import Link from "next/link";
import { useState } from "react";

type Props = {
  slug: string;
  code: string;
  name: string;
  index: number;
  imageSrc: string;
  priceLabel?: string; // ex. "25 €" — optionnel, affiché en lieu et place du "À VENIR"
};

export default function PlaceholderProductCard({
  slug,
  code,
  name,
  index,
  imageSrc,
  priceLabel,
}: Props) {
  const [imageOk, setImageOk] = useState(true);
  const fallbackNumber = String(index).padStart(2, "0");

  return (
    <Link href={`/shop/${slug}`} className="group block">
      <article>
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-md bg-white/[0.025] ring-1 ring-white/[0.06] transition-[box-shadow,_outline-color] duration-500 ease-out group-hover:ring-white/20"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 grid select-none place-items-center text-[110px] font-medium leading-none tracking-[-0.06em] text-white/[0.07] sm:text-[140px]"
          >
            {fallbackNumber}
          </span>

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

        <div className="mt-3">
          {code && code !== name ? (
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45 transition-colors duration-500 group-hover:text-white/75">
              {code}
            </p>
          ) : null}
          <p className={`${code && code !== name ? "mt-1" : ""} text-sm font-medium text-white`}>
            {name}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/35 tabular-nums">
            {priceLabel ?? "À venir"}
          </p>
        </div>
      </article>
    </Link>
  );
}
