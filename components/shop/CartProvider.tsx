"use client";

// Cart state (mockup) : entièrement en localStorage, pas de backend, pas de paiement.
// Une CartLine = (slug + size) avec une quantité. Les prix sont relus à chaque
// rendu depuis lib/shop/products — on ne stocke jamais les prix dans le panier.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, type Product, type ProductSize } from "@/lib/shop/products";

const STORAGE_KEY = "inespnj.shop.cart.v1";

export type CartLine = {
  slug: string;
  size: ProductSize;
  qty: number;
};

export type CartLineHydrated = CartLine & {
  product: Product;
  unitPriceCents: number;
  lineTotalCents: number;
};

type CartCtx = {
  lines: CartLine[];
  hydrated: CartLineHydrated[];
  count: number;
  subtotalCents: number;
  add: (slug: string, size: ProductSize, qty?: number) => void;
  setQty: (slug: string, size: ProductSize, qty: number) => void;
  remove: (slug: string, size: ProductSize) => void;
  clear: () => void;
  ready: boolean;
};

const Ctx = createContext<CartCtx | null>(null);

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is CartLine =>
          !!l &&
          typeof l === "object" &&
          typeof (l as CartLine).slug === "string" &&
          typeof (l as CartLine).size === "string" &&
          typeof (l as CartLine).qty === "number" &&
          (l as CartLine).qty > 0
      )
      .slice(0, 50);
  } catch {
    return [];
  }
}

function writeStorage(lines: CartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // QuotaExceeded ou private mode — on ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Hydration depuis localStorage au mount (jamais côté serveur)
  useEffect(() => {
    setLines(readStorage());
    setReady(true);
  }, []);

  // Persiste à chaque mutation
  useEffect(() => {
    if (ready) writeStorage(lines);
  }, [lines, ready]);

  const add = useCallback((slug: string, size: ProductSize, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug && l.size === size);
      if (existing) {
        return prev.map((l) =>
          l.slug === slug && l.size === size
            ? { ...l, qty: Math.min(l.qty + qty, 99) }
            : l
        );
      }
      return [...prev, { slug, size, qty: Math.min(qty, 99) }];
    });
  }, []);

  const setQty = useCallback((slug: string, size: ProductSize, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) {
        return prev.filter((l) => !(l.slug === slug && l.size === size));
      }
      return prev.map((l) =>
        l.slug === slug && l.size === size
          ? { ...l, qty: Math.min(qty, 99) }
          : l
      );
    });
  }, []);

  const remove = useCallback((slug: string, size: ProductSize) => {
    setLines((prev) =>
      prev.filter((l) => !(l.slug === slug && l.size === size))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const hydrated = useMemo<CartLineHydrated[]>(() => {
    return lines
      .map((l) => {
        const product = PRODUCTS.find((p) => p.slug === l.slug);
        if (!product) return null;
        return {
          ...l,
          product,
          unitPriceCents: product.priceCents,
          lineTotalCents: product.priceCents * l.qty,
        };
      })
      .filter((x): x is CartLineHydrated => x !== null);
  }, [lines]);

  const count = useMemo(() => hydrated.reduce((acc, l) => acc + l.qty, 0), [hydrated]);
  const subtotalCents = useMemo(
    () => hydrated.reduce((acc, l) => acc + l.lineTotalCents, 0),
    [hydrated]
  );

  const value: CartCtx = {
    lines,
    hydrated,
    count,
    subtotalCents,
    add,
    setQty,
    remove,
    clear,
    ready,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
