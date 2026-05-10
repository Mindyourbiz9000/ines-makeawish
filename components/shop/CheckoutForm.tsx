"use client";

// Formulaire de checkout MOCKUP. Les inputs adresse/paiement sont désactivés
// (juste pour la mise en scène). Le bouton "Simuler le paiement" déclenche
// une vraie server action qui insère un order + items dans Supabase, puis
// redirige sur /shop/success?ref=...
//
// Le panier (slug + size + qty) est sérialisé en JSON dans un hidden input
// pour que le serveur puisse rejouer les prix à partir du catalogue source.

import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/shop/products";
import { placeMockOrderAction } from "@/lib/shop/checkout-actions";

const COUNTRIES_EU = [
  "France",
  "Belgique",
  "Suisse",
  "Luxembourg",
  "Allemagne",
  "Espagne",
  "Italie",
  "Pays-Bas",
  "Portugal",
  "Autriche",
  "Irlande",
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] uppercase tracking-[0.22em] text-white/45">
      {children}
    </p>
  );
}

const baseInput =
  "w-full min-h-[48px] rounded-md bg-white/[0.025] px-3 text-[15px] text-white/85 ring-1 ring-white/[0.08] placeholder:text-white/25 disabled:cursor-not-allowed disabled:text-white/40";

export default function CheckoutForm() {
  const { lines, hydrated, subtotalCents, count, ready } = useCart();
  const [submitting, setSubmitting] = useState(false);

  // Pendant l'hydration : skeleton minimal
  if (!ready) {
    return (
      <p className="mt-12 text-[12px] text-white/40">Chargement…</p>
    );
  }

  // Cart vide → redirection douce vers /cart
  if (count === 0) {
    return (
      <div className="mt-12 flex flex-col items-start gap-4 border-t border-white/[0.08] pt-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          Aucun article
        </p>
        <p className="text-2xl font-medium tracking-[-0.02em] text-white sm:text-3xl">
          Ton panier est vide.
        </p>
        <p className="text-sm text-white/55">
          Ajoute des articles au catalogue avant de passer au paiement.
        </p>
      </div>
    );
  }

  // Snapshot du panier sérialisé pour le hidden input.
  const cartJson = JSON.stringify(
    lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty }))
  );

  return (
    <form
      action={placeMockOrderAction}
      onSubmit={() => setSubmitting(true)}
      className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[1fr_minmax(280px,360px)] md:gap-14"
    >
      <input type="hidden" name="cart_json" value={cartJson} />
      {/* Form fields */}
      <div className="flex flex-col gap-6">
        {/* Mockup banner */}
        <div className="rounded-md bg-neon-pink/10 px-4 py-3 ring-1 ring-neon-pink/30">
          <p className="text-[11px] uppercase tracking-[0.22em] text-neon-pink/85">
            Mockup — formulaire désactivé, aucun paiement ne sera effectué
          </p>
        </div>

        {/* Email */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
            Contact
          </p>
          <h2 className="mt-2 text-xl font-medium text-white">Adresse e-mail</h2>
          <div className="mt-4">
            <FieldLabel>E-mail</FieldLabel>
            <input
              type="email"
              disabled
              placeholder="—"
              className={baseInput}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Shipping */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
            Livraison
          </p>
          <h2 className="mt-2 text-xl font-medium text-white">Adresse</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel>Nom complet</FieldLabel>
              <input type="text" disabled placeholder="—" className={baseInput} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Adresse</FieldLabel>
              <input type="text" disabled placeholder="—" className={baseInput} />
            </div>
            <div>
              <FieldLabel>Code postal</FieldLabel>
              <input type="text" disabled placeholder="—" className={baseInput} />
            </div>
            <div>
              <FieldLabel>Ville</FieldLabel>
              <input type="text" disabled placeholder="—" className={baseInput} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Pays</FieldLabel>
              <select disabled className={baseInput}>
                {COUNTRIES_EU.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
            Paiement
          </p>
          <h2 className="mt-2 text-xl font-medium text-white">Carte bancaire</h2>
          <div className="mt-4 space-y-3">
            <div
              className={`${baseInput} flex items-center justify-between`}
              aria-disabled="true"
            >
              <span className="font-mono tabular-nums text-white/40">
                •••• •••• •••• 4242
              </span>
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/30">
                <span className="rounded-sm bg-white/[0.06] px-1.5 py-0.5">
                  VISA
                </span>
                <span className="rounded-sm bg-white/[0.06] px-1.5 py-0.5">
                  MC
                </span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`${baseInput} flex items-center text-white/30`}>
                MM / AA
              </div>
              <div className={`${baseInput} flex items-center text-white/30`}>
                CVC
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order recap aside */}
      <aside className="md:sticky md:top-6 md:self-start">
        <div className="rounded-2xl bg-white/[0.025] p-5 ring-1 ring-white/[0.08] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
            Ta commande
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {hydrated.map((line) => (
              <li
                key={`${line.slug}:${line.size}`}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="min-w-0 truncate text-white/85">
                  {line.product.code}{" "}
                  <span className="text-white/45">· {line.size} · ×{line.qty}</span>
                </span>
                <span className="shrink-0 tabular-nums text-white">
                  {formatPrice(line.lineTotalCents)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-white/[0.08] pt-5 text-sm">
            <div className="flex justify-between text-white/75">
              <dt>Sous-total</dt>
              <dd className="tabular-nums text-white">
                {formatPrice(subtotalCents)}
              </dd>
            </div>
            <div className="flex justify-between text-white/55">
              <dt>Livraison</dt>
              <dd className="tabular-nums">Offerte (mockup)</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-baseline justify-between border-t border-white/[0.08] pt-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
              Total
            </p>
            <p className="text-2xl font-semibold tabular-nums text-white">
              {formatPrice(subtotalCents)}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold uppercase tracking-[0.18em] text-night-900 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Simulation…" : "Simuler le paiement"}
          </button>
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-white/35">
            Aperçu mockup · aucun paiement réel
          </p>
        </div>
      </aside>
    </form>
  );
}
