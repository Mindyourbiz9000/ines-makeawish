"use client";

// Liste des lignes panier + contrôles +/- / supprimer + sous-total + bouton
// "Passer au paiement". Affiche un état vide éditorial s'il n'y a rien.

import Link from "next/link";
import { useCart, type CartLineHydrated } from "./CartProvider";
import { formatPrice } from "@/lib/shop/products";

function CartLineRow({ line }: { line: CartLineHydrated }) {
  const { setQty, remove } = useCart();
  return (
    <li className="flex gap-4 border-t border-white/[0.06] py-5 first:border-t-0 first:pt-0 sm:gap-6">
      <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-md bg-white/[0.025] ring-1 ring-white/[0.06] sm:w-28">
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center text-3xl font-medium leading-none tracking-[-0.04em] text-white/[0.08] sm:text-4xl"
        >
          {String(line.product.index).padStart(2, "0")}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={line.product.imageSrc}
          alt={line.product.code}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
              {line.product.code}
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {line.product.name}
            </p>
            <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-white/45">
              Taille {line.size}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-white">
            {formatPrice(line.lineTotalCents)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-md bg-white/[0.03] ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => setQty(line.slug, line.size, line.qty - 1)}
              aria-label="Diminuer la quantité"
              className="min-h-[40px] min-w-[40px] text-base text-white/70 transition-colors hover:text-white"
            >
              −
            </button>
            <span className="min-w-[1.25rem] text-center text-sm tabular-nums text-white">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(line.slug, line.size, line.qty + 1)}
              aria-label="Augmenter la quantité"
              className="min-h-[40px] min-w-[40px] text-base text-white/70 transition-colors hover:text-white"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => remove(line.slug, line.size)}
            className="text-[11px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
          >
            Supprimer
          </button>
        </div>
      </div>
    </li>
  );
}

export default function CartContent() {
  const { hydrated, subtotalCents, count, ready } = useCart();

  // Pendant l'hydration : skeleton minimal pour éviter le flash "vide".
  if (!ready) {
    return (
      <div className="mt-12 text-[12px] text-white/40">Chargement du panier…</div>
    );
  }

  if (count === 0) {
    return (
      <div className="mt-12 flex flex-col items-start gap-4 border-t border-white/[0.08] pt-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          Panier vide
        </p>
        <p className="text-2xl font-medium tracking-[-0.02em] text-white sm:text-3xl">
          Rien à voir ici, pour l&apos;instant.
        </p>
        <p className="text-sm text-white/55">
          Le merch SLAY arrive bientôt — en attendant tu peux explorer le catalogue.
        </p>
        <Link
          href="/shop"
          className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold uppercase tracking-[0.18em] text-night-900 transition-colors hover:bg-white/90"
        >
          ← Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[1fr_minmax(280px,360px)] md:gap-14">
      <ul>
        {hydrated.map((line) => (
          <CartLineRow key={`${line.slug}:${line.size}`} line={line} />
        ))}
      </ul>

      <aside className="md:sticky md:top-6 md:self-start">
        <div className="rounded-2xl bg-white/[0.025] p-5 ring-1 ring-white/[0.08] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
            Récapitulatif
          </p>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between text-white/75">
              <dt>Sous-total</dt>
              <dd className="tabular-nums text-white">{formatPrice(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between text-white/55">
              <dt>Livraison</dt>
              <dd className="tabular-nums">Calculé au paiement</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-white/[0.08] pt-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
              Total estimé
            </p>
            <p className="text-2xl font-semibold tabular-nums text-white">
              {formatPrice(subtotalCents)}
            </p>
          </div>
          <Link
            href="/shop/checkout"
            className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold uppercase tracking-[0.18em] text-night-900 transition-colors hover:bg-white/90"
          >
            Passer au paiement
          </Link>
        </div>
      </aside>
    </div>
  );
}
