// Masthead partagé entre toutes les pages /shop : retour InesPNJ à gauche,
// signal "Mockup" + cart badge à droite. Présent partout pour la cohérence
// éditoriale et le rappel constant que c'est un mockup.

import Link from "next/link";
import CartBadge from "./CartBadge";

export default function ShopMasthead() {
  return (
    <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/45">
      <Link href="/" className="transition-colors hover:text-white">
        ← InesPNJ
      </Link>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-pink"
          />
          <span>Mockup</span>
        </div>
        <CartBadge />
      </div>
    </nav>
  );
}
