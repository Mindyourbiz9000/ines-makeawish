"use client";

// Formulaire d'édition produit. Client component pour avoir l'état de
// soumission (pending) et la pastille "✓ Enregistré". La touche Entrée
// soumet le form depuis n'importe quel champ texte/number.

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { updateProductAction } from "@/lib/shop/admin-actions";
import { formatPrice } from "@/lib/shop/products";
import type { AdminProductRow } from "@/lib/shop/admin-queries";

const inputBase =
  "w-full min-h-[40px] rounded-md bg-white/[0.04] px-3 text-[14px] text-white/90 ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-white/30";

const btnPrimary =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 text-[12px] uppercase tracking-[0.18em] font-semibold text-night-900 transition-colors hover:bg-white/90";

const btnGhost =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.04] px-3 text-[12px] uppercase tracking-[0.18em] text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08] hover:text-white";

export default function ProductEditForm({ product }: { product: AdminProductRow }) {
  const p = product;
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateProductAction(formData);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 2400);
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      encType="multipart/form-data"
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        const target = e.target as HTMLElement;
        if (
          target.tagName === "TEXTAREA" ||
          target.tagName === "BUTTON" ||
          (target as HTMLInputElement).type === "submit"
        )
          return;
        e.preventDefault();
        formRef.current?.requestSubmit();
      }}
      className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2"
    >
      <input type="hidden" name="id" value={p.id} />

      <label className="block md:col-span-2">
        <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
          Nom du produit
        </span>
        <input name="name" defaultValue={p.name} className={inputBase} />
      </label>

      <details className="md:col-span-2">
        <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-white/35 hover:text-white/60">
          Avancé · code (label court personnalisé)
        </summary>
        <input
          name="code"
          defaultValue={p.code}
          className={`${inputBase} mt-2`}
          placeholder="Laisse vide pour utiliser le nom"
        />
      </details>

      <label className="block">
        <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
          Prix (€) · {formatPrice(p.price_cents)}
        </span>
        <input
          name="price_euros"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          defaultValue={(p.price_cents / 100).toFixed(2)}
          className={inputBase}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
          Ordre
        </span>
        <input
          name="sort_order"
          type="number"
          defaultValue={p.sort_order}
          className={inputBase}
        />
      </label>

      <div className="md:col-span-2">
        <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
          Image
        </p>
        <div className="flex flex-col gap-2 rounded-md bg-white/[0.02] p-3 ring-1 ring-white/[0.06] sm:flex-row sm:items-center">
          <input
            type="file"
            name="image_file"
            accept="image/*"
            className="block w-full text-[13px] text-white/85 file:mr-3 file:min-h-[36px] file:rounded-md file:border-0 file:bg-white/[0.08] file:px-3 file:text-[12px] file:uppercase file:tracking-[0.18em] file:font-semibold file:text-white file:transition-colors hover:file:bg-white/[0.14]"
          />
          <span className="text-[11px] text-white/35 sm:whitespace-nowrap">
            {p.image_src ? "Remplace l'actuelle si choisi" : "Sélectionne une image"}
          </span>
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-white/35 hover:text-white/60">
            Ou saisir un chemin /public manuellement
          </summary>
          <input
            name="image_src"
            defaultValue={p.image_src ?? ""}
            className={`${inputBase} mt-2`}
            placeholder="/shop/placeholder/..."
          />
        </details>
      </div>

      <label className="block md:col-span-2">
        <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
          Description
        </span>
        <textarea
          name="description"
          defaultValue={p.description ?? ""}
          rows={3}
          className={`${inputBase} min-h-[80px] py-2`}
        />
      </label>

      <label className="flex items-center gap-2 md:col-span-2">
        <input
          type="checkbox"
          name="active"
          defaultChecked={p.active}
          className="h-4 w-4 accent-emerald-400"
        />
        <span className="text-sm text-white/80">Actif (visible sur la boutique)</span>
      </label>

      <div className="md:col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Link href="/shop/admin/products" className={btnGhost}>
          Annuler
        </Link>
        {justSaved ? (
          <span className="rounded bg-emerald-500/15 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-300 ring-1 ring-emerald-500/30">
            ✓ Enregistré
          </span>
        ) : null}
      </div>
    </form>
  );
}
