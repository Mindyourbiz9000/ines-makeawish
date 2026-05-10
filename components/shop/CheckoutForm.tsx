"use client";

// Formulaire de checkout. L'utilisateur saisit son email, son nom, son
// adresse de livraison et son téléphone. Le bouton "Confirmer la commande"
// déclenche une server action qui insère un order + items dans Supabase
// puis redirige sur /shop/success?ref=...
//
// Pas d'intégration de paiement réelle pour l'instant — le passage du
// paiement est simulé. La commande arrive dans /shop/admin/orders pour que
// l'équipe contacte le client par email pour finaliser.

import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/shop/products";
import { placeOrderAction } from "@/lib/shop/checkout-actions";

const COUNTRIES = [
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

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-white/45"
    >
      {children}
      {required ? <span className="ml-1 text-neon-pink/80">*</span> : null}
    </label>
  );
}

const baseInput =
  "w-full min-h-[48px] rounded-md bg-white/[0.025] px-3 text-[15px] text-white/95 ring-1 ring-white/[0.1] placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/40 transition-shadow";

export default function CheckoutForm() {
  const { lines, hydrated, subtotalCents, count, ready } = useCart();
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return <p className="mt-12 text-[12px] text-white/40">Chargement…</p>;
  }

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
      action={placeOrderAction}
      onSubmit={() => setSubmitting(true)}
      className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[1fr_minmax(280px,360px)] md:gap-14"
    >
      <input type="hidden" name="cart_json" value={cartJson} />

      {/* Form fields */}
      <div className="flex flex-col gap-8">
        {/* Email */}
        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.32em] text-white/40">
            Contact
          </legend>
          <h2 className="mt-2 text-xl font-medium text-white">
            Adresse e-mail
          </h2>
          <p className="mt-1 text-[12px] text-white/55">
            On t&apos;envoie une confirmation et le suivi de livraison à cette
            adresse.
          </p>
          <div className="mt-4">
            <FieldLabel htmlFor="email" required>
              E-mail
            </FieldLabel>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="ton.email@exemple.com"
              className={baseInput}
            />
          </div>
        </fieldset>

        {/* Shipping */}
        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.32em] text-white/40">
            Livraison
          </legend>
          <h2 className="mt-2 text-xl font-medium text-white">Adresse</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="full_name" required>
                Nom complet
              </FieldLabel>
              <input
                id="full_name"
                type="text"
                name="full_name"
                required
                autoComplete="name"
                placeholder="Prénom Nom"
                className={baseInput}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="address_line_1" required>
                Adresse
              </FieldLabel>
              <input
                id="address_line_1"
                type="text"
                name="address_line_1"
                required
                autoComplete="address-line1"
                placeholder="12 rue du Stream"
                className={baseInput}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="address_line_2">
                Complément (étage, code, etc.)
              </FieldLabel>
              <input
                id="address_line_2"
                type="text"
                name="address_line_2"
                autoComplete="address-line2"
                placeholder="Bât. A, 3ème étage"
                className={baseInput}
              />
            </div>
            <div>
              <FieldLabel htmlFor="postal_code" required>
                Code postal
              </FieldLabel>
              <input
                id="postal_code"
                type="text"
                name="postal_code"
                required
                autoComplete="postal-code"
                placeholder="75001"
                className={baseInput}
              />
            </div>
            <div>
              <FieldLabel htmlFor="city" required>
                Ville
              </FieldLabel>
              <input
                id="city"
                type="text"
                name="city"
                required
                autoComplete="address-level2"
                placeholder="Paris"
                className={baseInput}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="country" required>
                Pays
              </FieldLabel>
              <select
                id="country"
                name="country"
                required
                autoComplete="country-name"
                defaultValue="France"
                className={baseInput}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="phone">Téléphone (optionnel)</FieldLabel>
              <input
                id="phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="+33 6 12 34 56 78"
                className={baseInput}
              />
            </div>
          </div>
        </fieldset>

        {/* Payment notice */}
        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.32em] text-white/40">
            Paiement
          </legend>
          <h2 className="mt-2 text-xl font-medium text-white">
            Bientôt par carte
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/65">
            Le paiement par carte arrive très vite. En attendant, confirme
            simplement ta commande — l&apos;équipe te recontacte par email
            sous 24h pour finaliser le règlement (virement, PayPal, ou Lydia,
            au choix). Tu n&apos;es engagé à rien tant que tu n&apos;as pas
            payé.
          </p>
        </fieldset>
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
                  <span className="text-white/45">
                    · {line.size} · ×{line.qty}
                  </span>
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
              <dd className="tabular-nums">Calculée plus tard</dd>
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
            {submitting ? "Enregistrement…" : "Confirmer la commande"}
          </button>
          <p className="mt-3 text-center text-[11px] text-white/45">
            En confirmant, tu acceptes que l&apos;équipe te contacte par email
            pour le règlement.
          </p>
        </div>
      </aside>
    </form>
  );
}
