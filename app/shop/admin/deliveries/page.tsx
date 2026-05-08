// Admin Deliveries : liste des livraisons + édition inline (carrier, tracking,
// statut, notes). Une delivery est créée automatiquement quand une commande
// passe en "shipped" (cf. updateOrderStatusAction).

import { listAllDeliveries } from "@/lib/shop/admin-queries";
import { upsertDeliveryAction } from "@/lib/shop/admin-actions";

export const dynamic = "force-dynamic";

const STATUSES = [
  "preparing",
  "shipped",
  "in_transit",
  "delivered",
  "exception",
] as const;

const STATUS_COLORS: Record<(typeof STATUSES)[number], string> = {
  preparing: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  shipped: "bg-neon-blue/15 text-neon-blue ring-neon-blue/40",
  in_transit: "bg-[#9146FF]/15 text-[#bf94ff] ring-[#9146FF]/30",
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  exception: "bg-red-500/15 text-red-300 ring-red-500/30",
};

const inputBase =
  "w-full min-h-[40px] rounded-md bg-white/[0.04] px-3 text-[13px] text-white/90 ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-white/30";

export default async function AdminDeliveriesPage() {
  const deliveries = await listAllDeliveries();

  return (
    <section>
      {deliveries.length === 0 ? (
        <p className="text-sm text-white/55">
          Aucune livraison. Une livraison est créée automatiquement quand une
          commande passe en statut <span className="font-mono">shipped</span>{" "}
          dans l&apos;onglet Commandes.
        </p>
      ) : (
        <ul className="space-y-3">
          {deliveries.map((d) => (
            <li
              key={d.id}
              className="rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.08]"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="font-mono text-sm font-semibold tabular-nums text-white">
                  {d.ref}
                </p>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ring-1 ${
                    STATUS_COLORS[d.status]
                  }`}
                >
                  {d.status}
                </span>
                {d.shipped_at ? (
                  <span className="text-[11px] text-white/45">
                    Expédié le{" "}
                    {new Date(d.shipped_at).toLocaleDateString("fr-FR")}
                  </span>
                ) : null}
                {d.delivered_at ? (
                  <span className="text-[11px] text-white/45">
                    Livré le{" "}
                    {new Date(d.delivered_at).toLocaleDateString("fr-FR")}
                  </span>
                ) : null}
              </div>

              <form
                action={upsertDeliveryAction}
                className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"
              >
                <input type="hidden" name="order_id" value={d.order_id} />

                <label className="block">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Transporteur
                  </span>
                  <input
                    name="carrier"
                    defaultValue={d.carrier ?? ""}
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
                    defaultValue={d.tracking_number ?? ""}
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
                    defaultValue={d.status}
                    className={inputBase}
                  >
                    {STATUSES.map((s) => (
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
                    defaultValue={d.notes ?? ""}
                    rows={2}
                    className={`${inputBase} min-h-[60px] py-2`}
                  />
                </label>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="min-h-[40px] rounded-md bg-white px-4 text-[12px] uppercase tracking-[0.18em] font-semibold text-night-900 transition-colors hover:bg-white/90"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
