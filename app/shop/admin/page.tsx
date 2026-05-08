// Vue d'ensemble admin : stats rapides + recent orders + raccourcis.

import Link from "next/link";
import {
  listAllProducts,
  listAllOrders,
  listAllDeliveries,
} from "@/lib/shop/admin-queries";
import { formatPrice } from "@/lib/shop/products";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/10">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
        {value}
      </p>
      {sub ? (
        <p className="mt-1 text-[12px] text-white/50">{sub}</p>
      ) : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [products, orders, deliveries] = await Promise.all([
    listAllProducts(),
    listAllOrders(20),
    listAllDeliveries(),
  ]);

  const activeProducts = products.filter((p) => p.active).length;
  const totalStock = products.reduce(
    (acc, p) => acc + p.variants.reduce((s, v) => s + v.stock, 0),
    0
  );
  const ordersCount = orders.length;
  const ordersTotal = orders.reduce((acc, o) => acc + o.total_cents, 0);
  const pendingDeliveries = deliveries.filter(
    (d) => d.status !== "delivered"
  ).length;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Produits actifs"
          value={activeProducts}
          sub={`${products.length} au total`}
        />
        <StatCard
          label="Stock total"
          value={totalStock.toLocaleString("fr-FR")}
          sub="toutes tailles confondues"
        />
        <StatCard
          label="Commandes"
          value={ordersCount}
          sub={formatPrice(ordersTotal)}
        />
        <StatCard
          label="Livraisons en cours"
          value={pendingDeliveries}
          sub={`${deliveries.length} au total`}
        />
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-medium text-white">Commandes récentes</h2>
          <Link
            href="/shop/admin/orders"
            className="text-[11px] uppercase tracking-[0.22em] text-white/45 transition-colors hover:text-white"
          >
            Voir tout →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-white/55">
            Aucune commande pour l&apos;instant. Quand un visiteur valide un
            paiement (mockup ou réel), elle apparaît ici.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-white/[0.06] rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.08]">
            {orders.slice(0, 5).map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    <span className="font-mono tabular-nums">{o.ref}</span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/55">
                    {new Date(o.created_at).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {o.mock ? (
                      <span className="ml-2 rounded bg-neon-pink/15 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-neon-pink/85">
                        mockup
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-white">
                    {formatPrice(o.total_cents)}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-white/50">
                    {o.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-12 text-[11px] uppercase tracking-[0.22em] text-white/35">
        Backoffice public · ne partage pas l&apos;URL /shop/admin
      </p>
    </>
  );
}
