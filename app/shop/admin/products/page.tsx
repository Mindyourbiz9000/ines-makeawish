// Admin Products : grille compacte de cartes cliquables. Chaque carte ouvre
// la page de détail /shop/admin/products/[id] pour l'édition complète.
// Le bouton "+ Nouveau produit" en haut à droite ouvre /shop/admin/products/new.

import Link from "next/link";
import { listAllProducts } from "@/lib/shop/admin-queries";
import { formatPrice } from "@/lib/shop/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listAllProducts();

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-white/55">
          {products.length} produit{products.length > 1 ? "s" : ""} · clique
          sur une carte pour éditer.
        </p>
        <Link
          href="/shop/admin/products/new"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-night-900 transition-colors hover:bg-white/90"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          Nouveau produit
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl bg-white/[0.02] p-6 text-sm text-white/55 ring-1 ring-white/[0.06]">
          Aucun produit. Clique sur « Nouveau produit » pour créer le premier.
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
  );
}
