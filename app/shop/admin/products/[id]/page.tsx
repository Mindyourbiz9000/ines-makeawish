// Page de détail/édition d'un produit. Server component qui fetche le produit
// et délègue le formulaire d'édition à un client component (pour l'état
// pending + feedback "Enregistré").

import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/shop/admin-queries";
import {
  deleteProductAction,
  deleteVariantAction,
  updateVariantStockAction,
  addVariantAction,
} from "@/lib/shop/admin-actions";
import ProductEditForm from "@/components/shop/admin/ProductEditForm";

export const dynamic = "force-dynamic";

const inputBase =
  "w-full min-h-[40px] rounded-md bg-white/[0.04] px-3 text-[14px] text-white/90 ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-white/30";

const btnGhost =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.04] px-3 text-[12px] uppercase tracking-[0.18em] text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08] hover:text-white";

const btnDanger =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-red-500/15 px-3 text-[12px] uppercase tracking-[0.18em] text-red-300 ring-1 ring-red-500/30 transition-colors hover:bg-red-500/25";

export default async function AdminProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) notFound();
  const p = await getProductById(id);
  if (!p) notFound();

  return (
    <>
      <div className="mb-6 flex items-baseline justify-between gap-3">
        <Link
          href="/shop/admin/products"
          className="text-[11px] uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-white"
        >
          ← Produits
        </Link>
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          #{p.id} ·{" "}
          <Link
            href={`/shop/${p.slug}`}
            target="_blank"
            className="font-mono normal-case tracking-normal text-white/55 underline decoration-white/15 underline-offset-4 hover:text-white"
          >
            /shop/{p.slug}
          </Link>
        </p>
      </div>

      <div className="rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.08] sm:p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Image */}
          <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-md bg-white/[0.025] ring-1 ring-white/[0.06] md:w-48">
            {p.image_src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_src}
                alt={p.code}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-4xl text-white/20">
                {p.code[0]}
              </span>
            )}
            <span
              className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] backdrop-blur ${
                p.active
                  ? "bg-emerald-500/30 text-emerald-200 ring-1 ring-emerald-500/40"
                  : "bg-black/40 text-white/55 ring-1 ring-white/15"
              }`}
            >
              {p.active ? "actif" : "inactif"}
            </span>
          </div>

          {/* Edit form (client) */}
          <ProductEditForm product={p} />
        </div>

        {/* Variants / stock */}
        <div className="mt-6 border-t border-white/[0.06] pt-5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Stock par taille
          </p>
          <div className="flex flex-wrap gap-2">
            {p.variants.length === 0 ? (
              <p className="text-[12px] text-white/45">Aucune variante.</p>
            ) : null}
            {p.variants.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 ring-1 ring-white/10"
              >
                <form
                  action={updateVariantStockAction}
                  className="flex items-center gap-1.5"
                >
                  <input type="hidden" name="variant_id" value={v.id} />
                  <span className="text-[12px] uppercase tracking-[0.18em] text-white/55">
                    {v.size}
                  </span>
                  <input
                    type="number"
                    name="stock"
                    min={0}
                    defaultValue={v.stock}
                    className="w-14 min-h-[32px] rounded bg-night-900/40 px-2 text-center text-[13px] tabular-nums text-white ring-1 ring-white/10 focus:outline-none focus:ring-white/30"
                  />
                  <button
                    type="submit"
                    className="text-[10px] uppercase tracking-[0.18em] text-white/55 hover:text-white"
                  >
                    OK
                  </button>
                </form>
                <form action={deleteVariantAction}>
                  <input type="hidden" name="variant_id" value={v.id} />
                  <button
                    type="submit"
                    aria-label={`Supprimer la taille ${v.size}`}
                    className="text-[12px] text-white/35 hover:text-red-300"
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </div>

          <form
            action={addVariantAction}
            className="mt-4 flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="product_id" value={p.id} />
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                Ajouter une taille
              </span>
              <input
                name="size"
                required
                placeholder="XXL"
                className={`${inputBase} w-24`}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                Stock initial
              </span>
              <input
                name="stock"
                type="number"
                min={0}
                defaultValue={10}
                className={`${inputBase} w-24`}
              />
            </label>
            <button type="submit" className={btnGhost}>
              Ajouter
            </button>
          </form>
        </div>

        <div className="mt-6 flex justify-end border-t border-white/[0.06] pt-5">
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={p.id} />
            <button type="submit" className={btnDanger}>
              Supprimer le produit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
