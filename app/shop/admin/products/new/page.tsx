// Page de création d'un produit. Le slug et le code sont auto-générés depuis
// le nom. Redirige vers /shop/admin/products après succès.

import Link from "next/link";
import { createProductAction } from "@/lib/shop/admin-actions";

export const dynamic = "force-dynamic";

const inputBase =
  "w-full min-h-[40px] rounded-md bg-white/[0.04] px-3 text-[14px] text-white/90 ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-white/30";

const btnPrimary =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 text-[12px] uppercase tracking-[0.18em] font-semibold text-night-900 transition-colors hover:bg-white/90";

const btnGhost =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.04] px-3 text-[12px] uppercase tracking-[0.18em] text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08] hover:text-white";

export default function AdminProductNewPage() {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/shop/admin/products"
          className="text-[11px] uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-white"
        >
          ← Produits
        </Link>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.02em] text-white sm:text-4xl">
          Nouveau produit
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Le produit est créé avec ses tailles initiales et un stock de 10 par
          défaut. L&apos;URL (slug) et le code (label court) sont générés
          automatiquement depuis le nom.
        </p>
      </div>

      <div className="rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.08] sm:p-6">
        <form
          action={createProductAction}
          encType="multipart/form-data"
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <label className="block md:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Nom du produit *{" "}
              <span className="text-white/35">
                (ex. &quot;Hoodie crème&quot;)
              </span>
            </span>
            <input
              name="name"
              required
              className={inputBase}
              placeholder="Hoodie crème"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Prix (centimes) *
            </span>
            <input
              name="price_cents"
              type="number"
              min={0}
              required
              className={inputBase}
              placeholder="6500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Ordre
            </span>
            <input
              name="sort_order"
              type="number"
              defaultValue={100}
              className={inputBase}
            />
          </label>
          <div className="md:col-span-2">
            <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
              Image
            </p>
            <div className="rounded-md bg-white/[0.02] p-3 ring-1 ring-white/[0.06]">
              <input
                type="file"
                name="image_file"
                accept="image/*"
                className="block w-full text-[13px] text-white/85 file:mr-3 file:min-h-[36px] file:rounded-md file:border-0 file:bg-white/[0.08] file:px-3 file:text-[12px] file:uppercase file:tracking-[0.18em] file:font-semibold file:text-white file:transition-colors hover:file:bg-white/[0.14]"
              />
              <p className="mt-1 text-[11px] text-white/35">
                Upload une image (jpg/png/webp, max 8 MB) — elle sera servie
                depuis Supabase Storage.
              </p>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-white/35 hover:text-white/60">
                Ou saisir un chemin /public manuellement
              </summary>
              <input
                name="image_src"
                className={`${inputBase} mt-2`}
                placeholder="/shop/placeholder/hoodie-noir.jpg"
              />
            </details>
          </div>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Description
            </span>
            <textarea
              name="description"
              rows={3}
              className={`${inputBase} min-h-[80px] py-2`}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Tailles (séparées par virgule)
            </span>
            <input
              name="sizes"
              defaultValue="XS,S,M,L,XL,XXL"
              className={inputBase}
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap items-center gap-2">
            <button type="submit" className={btnPrimary}>
              Créer le produit
            </button>
            <Link href="/shop/admin/products" className={btnGhost}>
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
