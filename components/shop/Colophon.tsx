// Pied de page sobre des pages /shop : copyright + lien retour.

import Link from "next/link";

export default function Colophon() {
  return (
    <footer className="mt-24 flex flex-col items-start gap-2 border-t border-white/[0.08] pt-6 text-[11px] leading-relaxed text-white/40 sm:flex-row sm:items-baseline sm:justify-between">
      <p className="uppercase tracking-[0.28em] text-white/55">
        © InesPNJ {new Date().getFullYear()}
      </p>
      <p>
        Une question ?{" "}
        <a
          href="mailto:contact@inespnj.com"
          className="text-white/60 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
        >
          contact@inespnj.com
        </a>
      </p>
    </footer>
  );
}
