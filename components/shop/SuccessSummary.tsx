"use client";

// Page de succès post-checkout. Lit la référence depuis ?ref=, snapshot le
// panier au mount, puis vide le panier pour que reload ne ré-affiche pas
// "réussi" sur des données obsolètes.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart, type CartLineHydrated } from "./CartProvider";
import { formatPrice } from "@/lib/shop/products";

type Snapshot = {
  lines: CartLineHydrated[];
  subtotalCents: number;
  count: number;
};

export default function SuccessSummary() {
  const search = useSearchParams();
  const ref = search?.get("ref") ?? "MOCK-?????";
  const { hydrated, subtotalCents, count, clear, ready } = useCart();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  // On capture le panier UNE FOIS (au mount) puis on le vide. Les rendus
  // suivants (reload, navigation back) verront le cart vide → on ré-utilise
  // le snapshot via state, donc l'order recap reste affiché tant qu'on est
  // sur la page.
  useEffect(() => {
    if (!ready || snapshot !== null) return;
    if (count > 0) {
      setSnapshot({ lines: hydrated, subtotalCents, count });
      clear();
    } else {
      // Cas refresh : aucun snapshot disponible
      setSnapshot({ lines: [], subtotalCents: 0, count: 0 });
    }
  }, [ready, hydrated, subtotalCents, count, snapshot, clear]);

  const eta = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 5);
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const fmt = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    });
    return `${fmt.format(start)} – ${fmt.format(end)}`;
  }, []);

  if (!ready || !snapshot) {
    return (
      <p className="mt-12 text-[12px] text-white/40">Chargement…</p>
    );
  }

  return (
    <>
      <header className="mt-12 sm:mt-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          Commande simulée · {ref}
        </p>
        <h1 className="neon-title mt-4 text-5xl leading-[1] sm:text-7xl">
          Merci !
        </h1>
        <p className="mt-6 max-w-md text-sm text-white/60 sm:text-base">
          {snapshot.count > 0
            ? `Ta commande mockup a été enregistrée. Livraison estimée entre le ${eta} (mockup, rien n'est expédié pour de vrai).`
            : "Ton panier est déjà vide. Cette page de confirmation n'a plus de récapitulatif à afficher — recommence depuis le catalogue pour relancer le flow."}
        </p>
      </header>

      {snapshot.count > 0 ? (
        <section className="mt-10 rounded-2xl bg-white/[0.025] p-5 ring-1 ring-white/[0.08] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
            Récapitulatif
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {snapshot.lines.map((line) => (
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
          <div className="mt-5 flex items-baseline justify-between border-t border-white/[0.08] pt-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
              Total simulé
            </p>
            <p className="text-2xl font-semibold tabular-nums text-white">
              {formatPrice(snapshot.subtotalCents)}
            </p>
          </div>
        </section>
      ) : null}

      {/* Mockup notice */}
      <section className="mt-10 rounded-md bg-neon-pink/10 px-4 py-3 ring-1 ring-neon-pink/30">
        <p className="text-[11px] uppercase tracking-[0.22em] text-neon-pink/85">
          Aucune vraie commande n&apos;a été créée — aucun paiement n&apos;a été
          prélevé.
        </p>
      </section>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/shop"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold uppercase tracking-[0.18em] text-night-900 transition-colors hover:bg-white/90"
        >
          ← Retour au catalogue
        </Link>
        <Link
          href="/"
          className="flex min-h-[52px] items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-6 text-sm font-medium text-white/85 transition-colors hover:border-white/40 hover:bg-white/[0.05]"
        >
          Retour à InesPNJ
        </Link>
      </div>
    </>
  );
}
