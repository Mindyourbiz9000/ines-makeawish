// Admin Products : liste produits + variants (stock par taille), édition
// inline (update prix/active, +/- stock, suppression), formulaire d'ajout.

import { listAllProducts } from "@/lib/shop/admin-queries";
import {
  createProductAction,
  deleteProductAction,
  deleteVariantAction,
  updateVariantStockAction,
  updateProductAction,
} from "@/lib/shop/admin-actions";
import { formatPrice } from "@/lib/shop/products";

export const dynamic = "force-dynamic";

const inputBase =
  "w-full min-h-[40px] rounded-md bg-white/[0.04] px-3 text-[14px] text-white/90 ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-white/30";

const btnPrimary =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 text-[12px] uppercase tracking-[0.18em] font-semibold text-night-900 transition-colors hover:bg-white/90";

const btnGhost =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.04] px-3 text-[12px] uppercase tracking-[0.18em] text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08] hover:text-white";

const btnDanger =
  "min-h-[40px] inline-flex items-center justify-center gap-2 rounded-md bg-red-500/15 px-3 text-[12px] uppercase tracking-[0.18em] text-red-300 ring-1 ring-red-500/30 transition-colors hover:bg-red-500/25";

export default async function AdminProductsPage() {
  const products = await listAllProducts();

  return (
    <>
      <section className="space-y-6">
        {products.length === 0 ? (
          <p className="text-sm text-white/55">
            Aucun produit. Crée le premier en bas de page.
          </p>
        ) : null}

        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.08]"
          >
            <div className="flex flex-col gap-5 md:flex-row">
              {/* Image */}
              <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-md bg-white/[0.025] ring-1 ring-white/[0.06] md:w-40">
                {p.image_src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_src}
                    alt={p.code}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-3xl text-white/20">
                    {p.code[0]}
                  </span>
                )}
              </div>

              {/* Edit form */}
              <form
                action={updateProductAction}
                encType="multipart/form-data"
                className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2"
              >
                <input type="hidden" name="id" value={p.id} />

                <div className="md:col-span-2 flex items-baseline justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                    #{p.id} · {p.slug}
                  </p>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                      p.active
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/[0.06] text-white/45"
                    }`}
                  >
                    {p.active ? "actif" : "inactif"}
                  </span>
                </div>

                <label className="block">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Slug
                  </span>
                  <input name="slug" defaultValue={p.slug} className={inputBase} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Code
                  </span>
                  <input name="code" defaultValue={p.code} className={inputBase} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Nom
                  </span>
                  <input name="name" defaultValue={p.name} className={inputBase} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Prix (centimes) · {formatPrice(p.price_cents)}
                  </span>
                  <input
                    name="price_cents"
                    type="number"
                    min={0}
                    defaultValue={p.price_cents}
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
                    defaultValue={p.sort_order}
                    className={inputBase}
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={p.active}
                    className="h-4 w-4 accent-emerald-400"
                  />
                  <span className="text-sm text-white/80">Actif</span>
                </label>

                <div className="md:col-span-2 flex flex-wrap items-center gap-2">
                  <button type="submit" className={btnPrimary}>
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>

            {/* Variants / stock */}
            <div className="mt-5 border-t border-white/[0.06] pt-5">
              <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/45">
                Stock par taille
              </p>
              <div className="flex flex-wrap gap-2">
                {p.variants.length === 0 ? (
                  <p className="text-[12px] text-white/45">Aucune variante.</p>
                ) : null}
                {p.variants.map((v) => (
                  <form
                    key={v.id}
                    action={updateVariantStockAction}
                    className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 ring-1 ring-white/10"
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
                ))}
                {/* Delete variant - separate forms inline */}
                {p.variants.map((v) => (
                  <form
                    key={`del-${v.id}`}
                    action={deleteVariantAction}
                    className="hidden"
                  >
                    <input type="hidden" name="variant_id" value={v.id} />
                  </form>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-white/[0.06] pt-5">
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  className={btnDanger}
                  // No confirm: trust the admin
                >
                  Supprimer le produit
                </button>
              </form>
            </div>
          </div>
        ))}
      </section>

      {/* Add new product */}
      <section className="mt-10 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] p-5">
        <h2 className="text-xl font-medium text-white">Ajouter un produit</h2>
        <p className="mt-1 text-sm text-white/55">
          Le produit est créé avec ses tailles initiales et un stock de 10 par
          défaut.
        </p>
        <form
          action={createProductAction}
          encType="multipart/form-data"
          className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Slug *
            </span>
            <input name="slug" required className={inputBase} placeholder="hoodie-noir" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Code *
            </span>
            <input name="code" required className={inputBase} placeholder="Hoodie" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Nom *
            </span>
            <input name="name" required className={inputBase} placeholder="SLAY" />
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
                Upload une image (jpg/png/webp, max 8 MB) — elle sera servie depuis Supabase Storage.
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
            <textarea name="description" rows={2} className={`${inputBase} min-h-[60px] py-2`} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Ordre
            </span>
            <input name="sort_order" type="number" defaultValue={100} className={inputBase} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Tailles (séparées par virgule)
            </span>
            <input name="sizes" defaultValue="XS,S,M,L,XL,XXL" className={inputBase} />
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
