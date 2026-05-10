// Admin Deliveries : board style kanban. 3 colonnes — "À traiter", "En route",
// "Livrée". Chaque commande est une card expansible (<details>) qui contient
// le form de planification. Quand on update le statut, la commande passe dans
// la bonne colonne au prochain refresh.
//
// Le statut commande se synchronise automatiquement (preparing/exception →
// rester paid, shipped/in_transit → shipped, delivered → delivered).

import { listOrdersForDeliveries } from "@/lib/shop/admin-queries";
import DeliveryCard from "@/components/shop/admin/DeliveryCard";
import type { AdminOrderWithDelivery } from "@/lib/shop/admin-queries";

export const dynamic = "force-dynamic";

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
