// Admin Orders : vue en lecture seule de toutes les commandes. Le statut
// se gère dans /shop/admin/deliveries (qui synchronise automatiquement la
// commande). Seule action possible ici : annuler une commande, ce qui
// déclenchera un remboursement quand Stripe sera connecté.

import Link from "next/link";
import { listAllOrders } from "@/lib/shop/admin-queries";
import { cancelOrderAction } from "@/lib/shop/admin-actions";
import { formatPrice } from "@/lib/shop/products";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  shipped: "bg-neon-blue/15 text-neon-blue ring-neon-blue/40",
  delivered: "bg-white/[0.08] text-white/80 ring-white/15",
  cancelled: "bg-red-500/15 text-red-300 ring-red-500/30",
  refunded: "bg-[#9146FF]/15 text-[#bf94ff] ring-[#9146FF]/30",
};

const CANCELLABLE = new Set(["pending", "paid", "shipped"]);

export default async function AdminOrdersPage() {
  const orders = await listAllOrders(200);

  return (
    <section>
      <p className="mb-6 max-w-2xl text-sm text-white/55">
        Vue lecture seule. Le statut d&apos;une commande se gère depuis l&apos;onglet{" "}
        <Link
          href="/shop/admin/deliveries"
          className="text-white/85 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
        >
          Livraisons
        </Link>{" "}
        — il se met à jour automatiquement quand tu planifies l&apos;expédition.
        Tu peux annuler une commande ici (un remboursement sera déclenché
        automatiquement quand Stripe sera connecté).
      </p>

      {orders.length === 0 ? (
        <p className="text-sm text-white/55">
          Aucune commande pour l&apos;instant.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-col gap-3 rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.08] sm:flex-row sm:items-center sm:gap-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-3">
                  <p className="font-mono text-sm font-semibold tabular-nums text-white">
                    {o.ref}
                  </p>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ring-1 ${
                      STATUS_COLORS[o.status] ??
                      "bg-white/[0.06] text-white/55 ring-white/10"
                    }`}
                  >
                    {o.status}
                  </span>
                  {o.mock ? (
                    <span className="rounded bg-neon-pink/15 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-neon-pink/85">
                      mockup
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[12px] text-white/55">
                  {new Date(o.created_at).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {" · "}
                  {o.item_count} article{o.item_count > 1 ? "s" : ""}
                  {o.customer_email ? ` · ${o.customer_email}` : ""}
                </p>
              </div>

              <p className="shrink-0 text-base font-semibold tabular-nums text-white sm:text-right">
                {formatPrice(o.total_cents)}
              </p>

              {CANCELLABLE.has(o.status) ? (
                <form action={cancelOrderAction}>
                  <input type="hidden" name="id" value={o.id} />
                  <button
                    type="submit"
                    className="min-h-[40px] rounded-md bg-red-500/10 px-3 text-[12px] uppercase tracking-[0.18em] text-red-300 ring-1 ring-red-500/30 transition-colors hover:bg-red-500/20"
                  >
                    Annuler
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
