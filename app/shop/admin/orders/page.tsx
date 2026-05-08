// Admin Orders : liste des commandes (mockup ou réelles), changement de
// statut inline. Quand on passe en "shipped", une livraison est créée
// automatiquement (cf. updateOrderStatusAction).

import { listAllOrders } from "@/lib/shop/admin-queries";
import { updateOrderStatusAction } from "@/lib/shop/admin-actions";
import { formatPrice } from "@/lib/shop/products";

export const dynamic = "force-dynamic";

const STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const STATUS_COLORS: Record<(typeof STATUSES)[number], string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  shipped: "bg-neon-blue/15 text-neon-blue ring-neon-blue/40",
  delivered: "bg-white/[0.08] text-white/80 ring-white/15",
  cancelled: "bg-red-500/15 text-red-300 ring-red-500/30",
  refunded: "bg-[#9146FF]/15 text-[#bf94ff] ring-[#9146FF]/30",
};

const inputBase =
  "min-h-[40px] rounded-md bg-white/[0.04] px-3 text-[13px] text-white/90 ring-1 ring-white/10 focus:outline-none focus:ring-white/30";

export default async function AdminOrdersPage() {
  const orders = await listAllOrders(200);

  return (
    <section>
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
                      STATUS_COLORS[o.status]
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

              <form action={updateOrderStatusAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select
                  name="status"
                  defaultValue={o.status}
                  className={inputBase}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-md bg-white/[0.06] px-3 text-[12px] uppercase tracking-[0.18em] text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/[0.10] hover:text-white"
                >
                  OK
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
