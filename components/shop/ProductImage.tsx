"use client";

// Image produit 4:5 portrait, avec fallback grand numéro et mark "Mockup".
// Réutilisée par PlaceholderProductCard (catalogue) et ProductDetail (PDP).

import { useState } from "react";

type Props = {
  imageSrc: string;
  alt: string;
  index: number;
  className?: string;
};

export default function ProductImage({
  imageSrc,
  alt,
  index,
  className = "",
}: Props) {
  const [imageOk, setImageOk] = useState(true);
  const fallbackNumber = String(index).padStart(2, "0");
  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden rounded-md bg-white/[0.025] ring-1 ring-white/[0.06] ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 grid select-none place-items-center text-[140px] font-medium leading-none tracking-[-0.06em] text-white/[0.07] sm:text-[180px]"
      >
        {fallbackNumber}
      </span>
      {imageOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={alt}
          onError={() => setImageOk(false)}
          className="absolute inset-0 h-full w-full object-cover"
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
  );
}
