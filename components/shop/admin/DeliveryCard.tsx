"use client";

// Card du board kanban Livraisons. Client component pour pouvoir refermer
// automatiquement le <details> après un update réussi.

import { useState, useTransition } from "react";
import { upsertDeliveryAction } from "@/lib/shop/admin-actions";
import { formatPrice } from "@/lib/shop/products";
import type { AdminOrderWithDelivery } from "@/lib/shop/admin-queries";

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

export default function DeliveryCard({ row }: { row: AdminOrderWithDelivery }) {
  const { order: o, delivery: d, items, shipping } = row;
  const status = d?.status ?? "none";
  const isException = status === "exception";

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await upsertDeliveryAction(formData);
      setJustSaved(true);
      setOpen(false);
      window.setTimeout(() => setJustSaved(false), 2400);
    });
  }

  return (
    <details
      open={open}
      onToggle={(e) => {
        if (!pending) setOpen(e.currentTarget.open);
      }}
      className={`group overflow-hidden rounded-2xl bg-white/[0.025] ring-1 transition-colors hover:bg-white/[0.04] ${
        isException ? "ring-red-500/30" : "ring-white/[0.08]"
      }`}
    >
      <summary className="cursor-pointer list-none p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-sm font-semibold tabular-nums text-white">
            {o.ref}
          </p>
          <div className="flex items-center gap-2">
            {justSaved ? (
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-emerald-300 ring-1 ring-emerald-500/30">
                ✓ Mis à jour
              </span>
            ) : (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ring-1 ${
                  STATUS_TONES[status]
                }`}
              >
                {STATUS_LABELS[status]}
              </span>
            )}
          </div>
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
        {/* Order details : articles + adresse pour préparer le colis */}
        <div className="mb-4 grid grid-cols-1 gap-4 rounded-md bg-white/[0.02] p-3 ring-1 ring-white/[0.06] sm:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              Articles à préparer
            </p>
            {items.length === 0 ? (
              <p className="mt-2 text-[12px] text-white/45">Aucun article.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-[12px]">
                {items.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-baseline justify-between gap-2"
                  >
                    <span className="min-w-0 text-white/85">
                      <span className="font-medium text-white">
                        {it.name}
                      </span>{" "}
                      <span className="text-white/45">
                        · {it.size} · ×{it.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums text-white/70">
                      {formatPrice(it.unit_price_cents * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              Adresse de livraison
            </p>
            {shipping ? (
              <address className="mt-2 not-italic text-[12px] leading-relaxed text-white/85">
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
                  <p className="mt-1 text-white/55">{shipping.phone}</p>
                ) : null}
              </address>
            ) : (
              <p className="mt-2 text-[12px] text-white/45">
                Pas d&apos;adresse renseignée.
              </p>
            )}
          </div>
        </div>

        {o.customer_email ? (
          <p className="mb-3 text-[11px] text-white/45">
            <span className="uppercase tracking-[0.18em]">Email · </span>
            {o.customer_email}
          </p>
        ) : null}
        <form
          action={handleSubmit}
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
              disabled={pending}
              className="min-h-[40px] rounded-md bg-white px-4 text-[12px] uppercase tracking-[0.18em] font-semibold text-night-900 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Enregistrement…" : d ? "Mettre à jour" : "Planifier"}
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
