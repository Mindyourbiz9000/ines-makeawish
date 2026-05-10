// Admin Deliveries : centre logistique. Liste TOUTES les commandes actives
// (hors cancelled / refunded), avec leur livraison existante OU un slot pour
// la planifier. Quand tu changes le statut delivery, la commande se met à
// jour automatiquement (preparing→paid, shipped/in_transit→shipped,
// delivered→delivered).

import { listOrdersForDeliveries } from "@/lib/shop/admin-queries";
import { upsertDeliveryAction } from "@/lib/shop/admin-actions";
import { formatPrice } from "@/lib/shop/products";

export const dynamic = "force-dynamic";

const DELIVERY_STATUSES = [
  "preparing",
  "shipped",
  "in_transit",
  "delivered",
  "exception",
] as const;

const STATUS_COLORS: Record<string, string> = {
  none: "bg-white/[0.06] text-white/55 ring-white/10",
  preparing: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  shipped: "bg-neon-blue/15 text-neon-blue ring-neon-blue/40",
  in_transit: "bg-[#9146FF]/15 text-[#bf94ff] ring-[#9146FF]/30",
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  exception: "bg-red-500/15 text-red-300 ring-red-500/30",
};

const ORDER_STATUS_HINT: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Payée — à expédier",
  shipped: "Expédiée",
  delivered: "Livrée",
};

const inputBase =
  "w-full min-h-[40px] rounded-md bg-white/[0.04] px-3 text-[13px] text-white/90 ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-white/30";

export default async function AdminDeliveriesPage() {
  const rows = await listOrdersForDeliveries();

  return (
    <section>
      <p className="mb-6 max-w-2xl text-sm text-white/55">
        Centre logistique. Sélectionne une commande pour planifier ou mettre à
        jour sa livraison. Le statut de la commande se met à jour
        automatiquement quand tu changes le statut de la livraison.
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-white/55">
          Aucune commande active.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ order: o, delivery: d }) => {
            const status = d?.status ?? "none";
            return (
              <li
                key={o.id}
                className="rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.08]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <p className="font-mono text-sm font-semibold tabular-nums text-white">
                      {o.ref}
                    </p>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ring-1 ${
                        STATUS_COLORS[status] ?? STATUS_COLORS.none
                      }`}
                    >
                      {status === "none" ? "À planifier" : status}
                    </span>
                    {o.mock ? (
                      <span className="rounded bg-neon-pink/15 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-neon-pink/85">
                        mockup
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-white/45">
                    {ORDER_STATUS_HINT[o.status] ?? o.status} ·{" "}
                    {formatPrice(o.total_cents)}
                  </p>
                </div>

                <p className="mt-2 text-[12px] text-white/55">
                  {new Date(o.created_at).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {" · "}
                  {o.item_count} article{o.item_count > 1 ? "s" : ""}
                  {o.customer_name ? ` · ${o.customer_name}` : ""}
                  {o.customer_email ? ` · ${o.customer_email}` : ""}
                </p>

                {d?.shipped_at || d?.delivered_at ? (
                  <p className="mt-1 text-[11px] text-white/45">
                    {d.shipped_at ? (
                      <>
                        Expédié le{" "}
                        {new Date(d.shipped_at).toLocaleDateString("fr-FR")}
                      </>
                    ) : null}
                    {d.shipped_at && d.delivered_at ? " · " : null}
                    {d.delivered_at ? (
                      <>
                        Livré le{" "}
                        {new Date(d.delivered_at).toLocaleDateString("fr-FR")}
                      </>
                    ) : null}
                  </p>
                ) : null}

                <form
                  action={upsertDeliveryAction}
                  className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"
                >
                  <input type="hidden" name="order_id" value={o.id} />

                  <label className="block">
                    <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Transporteur
                    </span>
                    <input
                      name="carrier"
                      defaultValue={d?.carrier ?? ""}
                      className={inputBase}
                      placeholder="Colissimo, Mondial Relay, …"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                      N° de suivi
                    </span>
                    <input
                      name="tracking_number"
                      defaultValue={d?.tracking_number ?? ""}
                      className={inputBase}
                      placeholder="6A12345678901"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Statut
                    </span>
                    <select
                      name="status"
                      defaultValue={d?.status ?? "preparing"}
                      className={inputBase}
                    >
                      {DELIVERY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block md:col-span-3">
                    <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Notes (interne)
                    </span>
                    <textarea
                      name="notes"
                      defaultValue={d?.notes ?? ""}
                      rows={2}
                      className={`${inputBase} min-h-[60px] py-2`}
                    />
                  </label>

                  <div className="md:col-span-3 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="min-h-[40px] rounded-md bg-white px-4 text-[12px] uppercase tracking-[0.18em] font-semibold text-night-900 transition-colors hover:bg-white/90"
                    >
                      {d ? "Mettre à jour" : "Planifier la livraison"}
                    </button>
                    <span className="text-[11px] text-white/40">
                      Le statut commande se met à jour automatiquement.
                    </span>
                  </div>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
