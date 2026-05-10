"use client";

// Vide le panier localStorage une fois au mount. Utilisé sur /shop/success
// quand la commande a été créée serveur-side : la source de vérité est en DB,
// le panier client n'a plus de raison d'exister.

import { useEffect } from "react";
import { useCart } from "./CartProvider";

export default function ClearCartOnMount() {
  const { ready, count, clear } = useCart();
  useEffect(() => {
    if (ready && count > 0) clear();
  }, [ready, count, clear]);
  return null;
}
