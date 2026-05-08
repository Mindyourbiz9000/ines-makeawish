"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

// Petit badge "Panier · N" dans le masthead. Lien vers /shop/cart. Cache son
// compteur pendant l'hydration pour éviter le flash.

export default function CartBadge() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/shop/cart"
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.8h7.4a2 2 0 0 0 2-1.6L20.5 7H6" />
        <circle cx="9" cy="20" r="1.2" />
        <circle cx="17" cy="20" r="1.2" />
      </svg>
      <span>Panier</span>
      {ready && count > 0 ? (
        <span className="tabular-nums text-white">· {count}</span>
      ) : null}
    </Link>
  );
}
