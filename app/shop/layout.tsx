import type { ReactNode } from "react";
import { CartProvider } from "@/components/shop/CartProvider";

// Wrap toutes les pages /shop dans le cart provider client. Le state est
// hydraté depuis localStorage au mount.

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
