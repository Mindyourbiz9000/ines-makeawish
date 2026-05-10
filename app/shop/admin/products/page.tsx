// Admin Products : grille compacte de cartes cliquables. Chaque carte ouvre
// la page de détail /shop/admin/products/[id] pour l'édition complète.
// Le formulaire d'ajout reste en bas.

import Link from "next/link";
import { listAllProducts } from "@/lib/shop/admin-queries";
import { createProductAction } from "@/lib/shop/admin-actions";
import { formatPrice } from "@/lib/shop/products";

export const dynamic = "force-dynamic";

const inputBase =
  "w-full min-h-[40px] rounded-md bg-white/[0.04] px-3 text-[14px] text-white/90 ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-white/30";

const btnPrimary =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 text-[12px] uppercase tracking-[0.18em] font-semibold text-night-900 transition-colors hover:bg-white/90";

export default async function AdminProductsPage() {
  const products = await listAllProducts();

  return (
    <>
      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <p className="text-sm text-white/55">
            {products.length} produit{products.length > 1 ? "s" : ""} · clique
            sur une carte pour éditer.
          </p>
          <a
            href="#new"
            className="text-[11px] uppercase tracking-[0.18em] text-white/55 underline decoration-white/20 underline-offset-4 hover:text-white"
          >
            + Nouveau
          </a>
        </div>

        {products.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.02] p-6 text-sm text-white/55 ring-1 ring-white/[0.06]">
            Aucun produit. Crée le premier en bas de page.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {products.map((p) => {
              const totalStock = p.variants.reduce(
                (acc, v) => acc + v.stock,
                0
              );
              return (
                <Link
                  key={p.id}
                  href={`/shop/admin/products/${p.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white/[0.025] ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.05] hover:ring-white/[0.15]"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-white/[0.025]">
                    {p.image_src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_src}
                        alt={p.code}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-4xl text-white/20">
                        {p.code[0]}
                      </span>
                    )}
                    <span
                      className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] backdrop-blur ${
                        p.active
                          ? "bg-emerald-500/30 text-emerald-200 ring-1 ring-emerald-500/40"
                          : "bg-black/40 text-white/55 ring-1 ring-white/15"
                      }`}
                    >
                      {p.active ? "actif" : "inactif"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <p className="truncate text-[13px] font-medium text-white">
                      {p.name}
                    </p>
                    <p className="flex items-baseline justify-between text-[11px] text-white/55">
                      <span className="tabular-nums text-white/80">
                        {formatPrice(p.price_cents)}
                      </span>
                      <span className="tabular-nums">
                        {totalStock} en stock
                      </span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Add new product */}
      <section
        id="new"
        className="mt-12 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] p-5 scroll-mt-6"
      >
        <h2 className="text-xl font-medium text-white">Ajouter un produit</h2>
        <p className="mt-1 text-sm text-white/55">
          Le produit est créé avec ses tailles initiales et un stock de 10 par
          défaut. L&apos;URL (slug) et le code (label court) sont générés
          automatiquement depuis le nom.
        </p>
        <form
          action={createProductAction}
          encType="multipart/form-data"
          className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <label className="block md:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Nom du produit *{" "}
              <span className="text-white/35">(ex. &quot;Hoodie crème&quot;)</span>
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
              rows={2}
              className={`${inputBase} min-h-[60px] py-2`}
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
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Tailles (séparées par virgule)
            </span>
            <input
              name="sizes"
              defaultValue="XS,S,M,L,XL,XXL"
              className={inputBase}
            />
          </label>

          <div className="md:col-span-2">
            <button type="submit" className={btnPrimary}>
              Créer le produit
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
