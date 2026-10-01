// Pastille flottante en bas de l'écran sur mobile, avec le CTA "Faire un don".
// Visible uniquement sous sm:. Respecte safe-area-inset-bottom (iPhone home indicator).

export default function MobileDonateBar() {
  return (
    <div
      className="fixed inset-x-3 z-40 sm:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
    >
      <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-night-800/85 py-2 pl-5 pr-2 backdrop-blur-lg">
        <span className="neon-title-sm flex-1 text-lg">#freeines</span>
        <a
          href="https://streamelements.com/inespnj/tip"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center rounded-full bg-gradient-to-r from-neon-pink to-neon-yellow px-6 text-[15px] font-semibold text-night-900 shadow-[0_8px_30px_-8px_rgba(255,58,166,0.8)]"
        >
          Faire un don
        </a>
      </div>
    </div>
  );
}
