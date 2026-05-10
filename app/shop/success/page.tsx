// Page de confirmation post-checkout. Server component : lit ?ref= depuis
// l'URL, fetch la commande depuis Supabase, rend le récap. Le panier client
// est vidé via le petit composant <ClearCartOnMount />.

import Link from "next/link";
import ShopMasthead from "@/components/shop/ShopMasthead";
import Colophon from "@/components/shop/Colophon";
import ClearCartOnMount from "@/components/shop/ClearCartOnMount";
import { createServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/shop/products";

export const metadata = {
  title: "Merci ! · Boutique InesPNJ (preview)",
  robots: { index: false, follow: false },
};

// On ne cache pas la page (la commande vient juste d'être créée)
export const dynamic = "force-dynamic";
export const revalidate = 0;

type OrderItem = {
  id: number;
  code: string;
  name: string;
  size: string;
  quantity: number;
  unit_price_cents: number;
};

async function fetchOrder(ref: string | undefined) {
  if (!ref) return null;
  const supabase = createServerClient();
  const { data: order } = await supabase
    .from("shop_orders")
    .select("*")
    .eq("ref", ref)
    .maybeSingle();
  if (!order) return null;
  const { data: items } = await supabase
    .from("shop_order_items")
    .select("*")
    .eq("order_id", order.id);
  return { order, items: (items ?? []) as OrderItem[] };
}

function fmtETA(): string {
  const start = new Date();
  start.setDate(start.getDate() + 5);
  const end = new Date();
  end.setDate(end.getDate() + 7);
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const result = await fetchOrder(searchParams.ref);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:pt-10">
      <ShopMasthead />
      <ClearCartOnMount />

      <header className="mt-12 sm:mt-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          {result
            ? `Commande simulée · ${result.order.ref}`
            : "Commande introuvable"}
        </p>
        <h1 className="neon-title mt-4 text-5xl leading-[1] sm:text-7xl">
          Merci !
        </h1>
        <p className="mt-6 max-w-md text-sm text-white/60 sm:text-base">
          {result
            ? `Ta commande mockup a été enregistrée. Livraison estimée entre le ${fmtETA()} (mockup, rien n'est expédié pour de vrai). Tu peux la retrouver dans /shop/admin/orders.`
            : "On n'a pas retrouvé cette commande dans la base. Si tu viens de cliquer sur un vieux lien, c'est normal — relance le flow depuis le catalogue."}
        </p>
      </header>

      {result ? (
        <section className="mt-10 rounded-2xl bg-white/[0.025] p-5 ring-1 ring-white/[0.08] sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
              Récapitulatif
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
              Statut · {result.order.status}
            </p>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            {result.items.map((line) => (
              <li
                key={line.id}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="min-w-0 truncate text-white/85">
                  {line.code !== line.name ? (
                    <>
                      {line.code}{" "}
                      <span className="text-white/45">· {line.name}</span>
                    </>
                  ) : (
                    line.name
                  )}{" "}
                  <span className="text-white/45">
                    · {line.size} · ×{line.quantity}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-white">
                  {formatPrice(line.unit_price_cents * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-white/[0.08] pt-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
              Total simulé
            </p>
            <p className="text-2xl font-semibold tabular-nums text-white">
              {formatPrice(result.order.total_cents)}
            </p>
          </div>
        </section>
      ) : null}

      {/* Mockup notice */}
      <section className="mt-10 rounded-md bg-neon-pink/10 px-4 py-3 ring-1 ring-neon-pink/30">
        <p className="text-[11px] uppercase tracking-[0.22em] text-neon-pink/85">
          Commande mockup — aucun paiement n&apos;a été prélevé. La ligne reste
          visible dans /shop/admin/orders pour démontrer le flow.
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

      <Colophon />
    </main>
  );
}
