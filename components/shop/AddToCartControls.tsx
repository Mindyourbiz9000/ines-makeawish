"use client";

// Selecteur taille + quantité + bouton "Ajouter au panier" pour la PDP.
// Le bouton se trouve désactivé tant qu'aucune taille n'est sélectionnée.

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import type { Product, ProductSize } from "@/lib/shop/products";

type Props = {
  product: Product;
};

export default function AddToCartControls({ product }: Props) {
  const { add } = useCart();
  const [size, setSize] = useState<ProductSize | null>(null);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    if (!size) return;
    add(product.slug, size, qty);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  }

  const canAdd = size !== null;

  return (
    <div className="flex flex-col gap-6">
      {/* Taille */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/45">
          Taille
        </p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const active = size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={active}
                className={`min-h-[44px] min-w-[44px] rounded-md px-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-night-900 ring-1 ring-white"
                    : "bg-white/[0.03] text-white/85 ring-1 ring-white/10 hover:bg-white/[0.06] hover:ring-white/30"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantité */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/45">
          Quantité
        </p>
        <div className="inline-flex items-center gap-3 rounded-md bg-white/[0.03] ring-1 ring-white/10">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuer la quantité"
            className="min-h-[44px] min-w-[44px] text-lg text-white/70 transition-colors hover:text-white"
          >
            −
          </button>
          <span className="min-w-[1.5rem] text-center text-sm tabular-nums text-white">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Augmenter la quantité"
            className="min-h-[44px] min-w-[44px] text-lg text-white/70 transition-colors hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to cart */}
      <div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold uppercase tracking-[0.18em] transition-all ${
            canAdd
              ? "bg-white text-night-900 hover:bg-white/90"
              : "cursor-not-allowed bg-white/10 text-white/40"
          }`}
        >
          {justAdded ? "✓ Ajouté au panier" : "Ajouter au panier"}
        </button>
        <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-white/35">
          Aperçu mockup · aucun paiement réel
        </p>
        {justAdded ? (
          <p className="mt-3 text-center text-[12px] text-white/65">
            <Link
              href="/shop/cart"
              className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              Voir le panier →
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
