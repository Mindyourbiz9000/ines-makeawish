// Page publique de suivi de commande. URL : /orders/SLAY-XXXXXX?t=<uuid>.
// Le `t` (view_token) gate l'accès — sans le bon token, la page renvoie un
// 404 (on ne révèle même pas si la commande existe).

import Link from "next/link";
import { notFound } from "next/navigation";
import Colophon from "@/components/shop/Colophon";
import { createServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/shop/products";

export const metadata = {
  title: "Suivi de commande · InesPNJ",
  robots: { index: false, follow: false },
};

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

type Shipping = {
  fullName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
};

type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type DeliveryStatus =
  | "preparing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "exception";

async function fetchOrder(ref: string, token: string) {
  const supabase = createServerClient();
  const { data: order } = await supabase
    .from("shop_orders")
    .select("*")
    .eq("ref", ref)
    .eq("view_token", token)
    .maybeSingle();
  if (!order) return null;
  const [{ data: items }, { data: delivery }] = await Promise.all([
    supabase
      .from("shop_order_items")
      .select("*")
      .eq("order_id", order.id),
    supabase
      .from("shop_deliveries")
      .select("*")
      .eq("order_id", order.id)
      .maybeSingle(),
  ]);
  return {
    order,
    items: (items ?? []) as OrderItem[],
    delivery: delivery ?? null,
  };
}

const STEPS: { key: OrderStatus | DeliveryStatus; label: string }[] = [
  { key: "pending", label: "Commande reçue" },
  { key: "paid", label: "Confirmée" },
  { key: "shipped", label: "Expédiée" },
  { key: "delivered", label: "Livrée" },
];

function currentStepIndex(
  orderStatus: OrderStatus,
  deliveryStatus: DeliveryStatus | null
): number {
  if (orderStatus === "delivered" || deliveryStatus === "delivered") return 3;
  if (
    orderStatus === "shipped" ||
    deliveryStatus === "shipped" ||
    deliveryStatus === "in_transit"
  )
    return 2;
  if (orderStatus === "paid") return 1;
  if (orderStatus === "pending") return 0;
  return 0;
}

function ProgressBar({
  step,
  cancelled,
}: {
  step: number;
  cancelled: boolean;
}) {
  return (
    <ol className="grid grid-cols-4 gap-2">
      {STEPS.map((s, i) => {
        const reached = !cancelled && i <= step;
        const current = !cancelled && i === step;
        return (
          <li key={s.key} className="flex flex-col gap-2">
            <div
              className={`h-1 rounded-full transition-colors ${
                cancelled
                  ? "bg-red-500/30"
                  : reached
                    ? "bg-neon-pink"
                    : "bg-white/[0.08]"
              }`}
            />
            <p
              className={`text-[10px] uppercase tracking-[0.18em] ${
                cancelled
                  ? "text-red-300/70"
                  : current
                    ? "text-white"
                    : reached
                      ? "text-white/75"
                      : "text-white/30"
              }`}
            >
              {s.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: { ref: string };
  searchParams: { t?: string };
}) {
  const ref = decodeURIComponent(params.ref);
  const token = searchParams.t;
  if (!token) notFound();
  const result = await fetchOrder(ref, token);
  if (!result) notFound();
  const { order, items, delivery } = result;
  const shipping = (order.shipping ?? null) as Shipping | null;
  const cancelled =
    order.status === "cancelled" || order.status === "refunded";
  const step = currentStepIndex(
    order.status as OrderStatus,
    (delivery?.status as DeliveryStatus | null) ?? null
  );

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:pt-10">
      <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/45">
        <Link href="/" className="transition-colors hover:text-white">
          ← InesPNJ
        </Link>
        <Link
          href="/shop"
          className="transition-colors hover:text-white"
        >
          Boutique
        </Link>
      </nav>

      <header className="mt-12 sm:mt-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          Suivi de commande
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.02em] text-white sm:text-5xl">
          <span className="font-mono tabular-nums">{order.ref}</span>
        </h1>
        <p className="mt-3 text-sm text-white/55">
          Passée le{" "}
          {new Date(order.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {order.customer_name ? ` · ${order.customer_name}` : ""}
        </p>
      </header>

      <section className="mt-10 rounded-2xl bg-white/[0.025] p-5 ring-1 ring-white/[0.08] sm:p-7">
        {cancelled ? (
          <p className="text-sm font-medium text-red-300">
            Cette commande a été {order.status === "cancelled" ? "annulée" : "remboursée"}.
            {order.customer_email ? (
              <>
                {" "}Un email a été envoyé à{" "}
                <span className="text-white/90">{order.customer_email}</span>.
              </>
            ) : null}
          </p>
        ) : (
          <ProgressBar step={step} cancelled={cancelled} />
        )}

        {delivery?.carrier || delivery?.tracking_number ? (
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2">
            {delivery.carrier ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                  Transporteur
                </p>
                <p className="mt-1 text-base font-medium text-white">
                  {delivery.carrier}
                </p>
              </div>
            ) : null}
            {delivery.tracking_number ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                  N° de suivi
                </p>
                <p className="mt-1 font-mono text-base tabular-nums text-white break-all">
                  {delivery.tracking_number}
                </p>
              </div>
            ) : null}
            {delivery.shipped_at ? (
              <p className="text-[11px] text-white/45 sm:col-span-2">
                Expédiée le{" "}
                {new Date(delivery.shipped_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            ) : null}
            {delivery.delivered_at ? (
              <p className="text-[11px] text-emerald-300/80 sm:col-span-2">
                Livrée le{" "}
                {new Date(delivery.delivered_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-white/[0.025] p-5 ring-1 ring-white/[0.08] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
            Articles ({items.reduce((acc, i) => acc + i.quantity, 0)})
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {items.map((line) => (
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
              Total
            </p>
            <p className="text-2xl font-semibold tabular-nums text-white">
              {formatPrice(order.total_cents)}
            </p>
          </div>
        </div>

        {shipping ? (
          <div className="rounded-2xl bg-white/[0.025] p-5 ring-1 ring-white/[0.08] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
              Livraison
            </p>
            <address className="mt-5 not-italic text-sm leading-relaxed text-white/85">
              {shipping.fullName ? (
                <p className="font-medium text-white">{shipping.fullName}</p>
              ) : null}
              {shipping.addressLine1 ? <p>{shipping.addressLine1}</p> : null}
              {shipping.addressLine2 ? <p>{shipping.addressLine2}</p> : null}
              {shipping.postalCode || shipping.city ? (
                <p>
                  {[shipping.postalCode, shipping.city]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              ) : null}
              {shipping.country ? <p>{shipping.country}</p> : null}
              {shipping.phone ? (
                <p className="mt-2 text-white/55">{shipping.phone}</p>
              ) : null}
            </address>
          </div>
        ) : null}
      </section>

      <p className="mt-10 text-[12px] text-white/45">
        Une question sur ta commande ?{" "}
        <a
          href="mailto:contact@inespnj.com"
          className="text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white"
        >
          contact@inespnj.com
        </a>
      </p>

      <Colophon />
    </main>
  );
}
