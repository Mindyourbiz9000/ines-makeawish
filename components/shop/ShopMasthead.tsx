// Masthead partagé entre toutes les pages /shop : retour InesPNJ à gauche,
// cart badge à droite.

import Link from "next/link";
import CartBadge from "./CartBadge";

export default function ShopMasthead() {
  return (
    <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/45">
      <Link href="/" className="transition-colors hover:text-white">
        ← InesPNJ
      </Link>
      <CartBadge />
    </nav>
  );
}
