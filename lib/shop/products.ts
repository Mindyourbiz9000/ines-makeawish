// Catalogue produits SLAY (mockup, pas de vraie source de données).
// Source de vérité partagée entre /shop, /shop/[slug], /shop/cart, etc.
//
// Quand on passera en vraie boutique : remplacer ce fichier par une fonction
// asynchrone qui lit depuis Supabase (cf. plan eShop dans /root/.claude/plans).

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type Product = {
  slug: string;
  code: string;          // label court (ex. "T-shirt")
  name: string;          // ex. "SLAY"
  index: number;         // 1..6, utilisé pour le fallback typographique
  imageSrc: string;
  description: string;
  /** Prix en centimes d'euros — éviter les floats. 2500 = 25,00 €. */
  priceCents: number;
  sizes: ProductSize[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "t-shirt-noir",
    code: "T-shirt",
    name: "SLAY",
    index: 1,
    imageSrc: "/shop/placeholder/tshirt-noir.jpg",
    description:
      "T-shirt noir 100% coton avec gros logo SLAY centré. Coupe regular, façonné pour durer.",
    priceCents: 2500,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    slug: "t-shirt-cropped",
    code: "T-shirt cropped",
    name: "SLAY",
    index: 2,
    imageSrc: "/shop/placeholder/tshirt-cropped.jpg",
    description:
      "T-shirt cropped bordeaux, logo SLAY discret côté cœur. Coupe ajustée, idéal layering.",
    priceCents: 2700,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "sweat-blanc",
    code: "Sweat",
    name: "SLAY",
    index: 3,
    imageSrc: "/shop/placeholder/sweat-blanc.jpg",
    description:
      "Sweat blanc oversize avec gros logo SLAY rose néon. Molleton gratté intérieur.",
    priceCents: 4900,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    slug: "sweat-rose",
    code: "Sweat rosé",
    name: "SLAY",
    index: 4,
    imageSrc: "/shop/placeholder/sweat-rose.jpg",
    description:
      "Sweat rose poudré avec logo SLAY noir et petit cœur sur le Y. Confort signature.",
    priceCents: 4900,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "hoodie-noir",
    code: "Hoodie",
    name: "SLAY",
    index: 5,
    imageSrc: "/shop/placeholder/hoodie-noir.jpg",
    description:
      "Hoodie noir oversize, logo SLAY côté cœur. Matière lourde, capuche doublée.",
    priceCents: 6500,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    slug: "hoodie-creme",
    code: "Hoodie crème",
    name: "SLAY",
    index: 6,
    imageSrc: "/shop/placeholder/hoodie-creme.jpg",
    description:
      "Hoodie crème oversize, logo SLAY discret en serif. Toucher peach skin.",
    priceCents: 6500,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPrice(cents: number, currency: "EUR" = "EUR"): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
}
