import { Suspense } from "react";
import ShopMasthead from "@/components/shop/ShopMasthead";
import SuccessSummary from "@/components/shop/SuccessSummary";
import Colophon from "@/components/shop/Colophon";

export const metadata = {
  title: "Merci ! · Boutique InesPNJ (preview)",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:pt-10">
      <ShopMasthead />
      <Suspense
        fallback={<p className="mt-12 text-[12px] text-white/40">Chargement…</p>}
      >
        <SuccessSummary />
      </Suspense>
      <Colophon />
    </main>
  );
}
