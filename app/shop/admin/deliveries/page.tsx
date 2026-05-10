// Admin Deliveries : board style kanban. 3 colonnes — "À traiter", "En route",
// "Livrée". Chaque commande est une card expansible (<details>) qui contient
// le form de planification. Quand on update le statut, la commande passe dans
// la bonne colonne au prochain refresh.
//
// Le statut commande se synchronise automatiquement (preparing/exception →
// rester paid, shipped/in_transit → shipped, delivered → delivered).

import { listOrdersForDeliveries } from "@/lib/shop/admin-queries";
import { upsertDeliveryAction } from "@/lib/shop/admin-actions";
import { formatPrice } from "@/lib/shop/products";
import type { AdminOrderWithDelivery } from "@/lib/shop/admin-queries";

export const dynamic = "force-dynamic";

const DELIVERY_STATUSES = [
  "preparing",
  "shipped",
  "in_transit",
  "delivered",
  "exception",
] as const;

const STATUS_LABELS: Record<string, string> = {
  none: "À planifier",
  preparing: "En préparation",
  shipped: "Expédiée",
  in_transit: "En transit",
  delivered: "Livrée",
  exception: "Anomalie",
};

const STATUS_TONES: Record<string, string> = {
  none: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  preparing: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  shipped: "bg-neon-blue/15 text-neon-blue ring-neon-blue/40",
  in_transit: "bg-[#9146FF]/15 text-[#bf94ff] ring-[#9146FF]/30",
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  exception: "bg-red-500/15 text-red-300 ring-red-500/30",
};

const inputBase =
  "w-full min-h-[40px] rounded-md bg-white/[0.04] px-3 text-[13px] text-white/90 ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-white/30";

function daysAgo(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours <= 0) return "à l'instant";
    return `il y a ${hours}h`;
  }
  if (days === 1) return "hier";
  return `il y a ${days}j`;
}

function bucketize(rows: AdminOrderWithDelivery[]) {
  const todo: AdminOrderWithDelivery[] = [];
  const enroute: AdminOrderWithDelivery[] = [];
  const done: AdminOrderWithDelivery[] = [];
  for (const row of rows) {
    const s = row.delivery?.status ?? "none";
    if (s === "none" || s === "preparing" || s === "exception") {
      todo.push(row);
    } else if (s === "shipped" || s === "in_transit") {
      enroute.push(row);
    } else if (s === "delivered") {
      done.push(row);
    }
  }
  // À traiter : exception en premier (urgence), puis no-delivery, puis preparing.
  // Et à âge décroissant (les plus vieux d'abord — plus prioritaires).
  todo.sort((a, b) => {
    const sa = a.delivery?.status ?? "none";
    const sb = b.delivery?.status ?? "none";
    const order = (s: string) =>
      s === "exception" ? 0 : s === "none" ? 1 : 2;
    if (order(sa) !== order(sb)) return order(sa) - order(sb);
    return Date.parse(a.order.created_at) - Date.parse(b.order.created_at);
  });
  // En route : trier par date d'expédition desc (récent d'abord)
  enroute.sort(
    (a, b) =>
      Date.parse(b.delivery?.shipped_at ?? b.order.created_at) -
      Date.parse(a.delivery?.shipped_at ?? a.order.created_at)
  );
  // Livrées : récent d'abord
  done.sort(
    (a, b) =>
      Date.parse(b.delivery?.delivered_at ?? b.order.created_at) -
      Date.parse(a.delivery?.delivered_at ?? a.order.created_at)
  );
  return { todo, enroute, done };
}

function DeliveryCard({ row }: { row: AdminOrderWithDelivery }) {
  const { order: o, delivery: d } = row;
  const status = d?.status ?? "none";
  const isException = status === "exception";
  return (
    <details
      className={`group overflow-hidden rounded-2xl bg-white/[0.025] ring-1 transition-colors hover:bg-white/[0.04] ${
        isException ? "ring-red-500/30" : "ring-white/[0.08]"
      }`}
    >
      <summary className="cursor-pointer list-none p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-sm font-semibold tabular-nums text-white">
            {o.ref}
          </p>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ring-1 ${
              STATUS_TONES[status]
            }`}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>
        <p className="mt-2 truncate text-[13px] text-white/80">
          {o.customer_name ?? "Client anonyme"}
        </p>
        <p className="mt-1 text-[12px] text-white/50">
          {daysAgo(o.created_at)} ·{" "}
          <span className="tabular-nums">{formatPrice(o.total_cents)}</span> ·{" "}
          {o.item_count} art.
          {o.mock ? (
            <span className="ml-2 rounded bg-neon-pink/15 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-neon-pink/85">
              mockup
            </span>
          ) : null}
        </p>
        {d?.carrier || d?.tracking_number ? (
          <p className="mt-1 truncate text-[11px] text-white/55">
            {d.carrier ?? ""}
            {d.carrier && d.tracking_number ? " · " : ""}
            {d.tracking_number ? (
              <span className="font-mono tabular-nums">{d.tracking_number}</span>
            ) : null}
          </p>
        ) : null}
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/30 group-open:hidden">
          Cliquer pour planifier ↓
        </p>
      </summary>

      <div className="border-t border-white/[0.08] p-4">
        {o.customer_email ? (
          <p className="mb-3 text-[11px] text-white/45">
            <span className="uppercase tracking-[0.18em]">Email · </span>
            {o.customer_email}
          </p>
        ) : null}
        <form
          action={upsertDeliveryAction}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
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

          <label className="block sm:col-span-2">
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
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
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

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="min-h-[40px] rounded-md bg-white px-4 text-[12px] uppercase tracking-[0.18em] font-semibold text-night-900 transition-colors hover:bg-white/90"
            >
              {d ? "Mettre à jour" : "Planifier"}
            </button>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Statut commande auto · email envoyé au client
            </span>
          </div>
        </form>
      </div>
    </details>
  );
}

function Column({
  title,
  rows,
  emptyHint,
  toneClass,
}: {
  title: string;
  rows: AdminOrderWithDelivery[];
  emptyHint: string;
  toneClass: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-2">
        <div className="flex items-baseline gap-2">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${toneClass}`}
          />
          <h3 className="text-[11px] uppercase tracking-[0.28em] text-white/80">
            {title}
          </h3>
        </div>
        <span className="text-[11px] tabular-nums text-white/45">
          {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-white/[0.015] p-4 text-[12px] text-white/35 ring-1 ring-white/[0.05]">
          {emptyHint}
        </p>
      ) : (
        rows.map((row) => <DeliveryCard key={row.order.id} row={row} />)
      )}
    </div>
  );
}

export default async function AdminDeliveriesPage() {
  const rows = await listOrdersForDeliveries();
  const { todo, enroute, done } = bucketize(rows);

  return (
    <section>
      <p className="mb-6 max-w-2xl text-sm text-white/55">
        Centre logistique. Glisse-toi dans une carte pour planifier
        l&apos;expédition. Le statut commande et l&apos;email client sont mis à
        jour automatiquement quand tu changes le statut livraison.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Column
          title="À traiter"
          rows={todo}
          emptyHint="Tout est planifié, rien à préparer."
          toneClass="bg-amber-400"
        />
        <Column
          title="En route"
          rows={enroute}
          emptyHint="Aucune commande en transit."
          toneClass="bg-neon-blue"
        />
        <Column
          title="Livrée"
          rows={done}
          emptyHint="Pas encore de commande livrée."
          toneClass="bg-emerald-400"
        />
      </div>
    </section>
  );
}
