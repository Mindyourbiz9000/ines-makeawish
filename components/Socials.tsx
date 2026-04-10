// Icônes Simple Icons (MIT) inlinées pour éviter une dépendance.
// https://simpleicons.org/

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301C8.416 2.175 8.796 2.163 12 2.163zm0 1.838c-3.155 0-3.507.01-4.747.067-1.01.047-1.56.213-1.925.353-.484.188-.83.413-1.193.776-.363.363-.588.71-.776 1.193-.14.365-.306.914-.353 1.925C3.013 8.493 3 8.845 3 12c0 3.155.013 3.507.07 4.747.047 1.01.213 1.56.353 1.925.188.484.413.83.776 1.193.363.363.71.588 1.193.776.365.14.914.306 1.925.353C8.493 20.987 8.845 21 12 21c3.155 0 3.507-.013 4.747-.07 1.01-.047 1.56-.213 1.925-.353.484-.188.83-.413 1.193-.776.363-.363.588-.71.776-1.193.14-.365.306-.914.353-1.925.057-1.24.07-1.592.07-4.747 0-3.155-.013-3.507-.07-4.747-.047-1.01-.213-1.56-.353-1.925a3.207 3.207 0 0 0-.776-1.193 3.207 3.207 0 0 0-1.193-.776c-.365-.14-.914-.306-1.925-.353C15.507 3.013 15.155 3 12 3zm0 3.838a5.163 5.163 0 1 1 0 10.325 5.163 5.163 0 0 1 0-10.325zm0 8.513a3.35 3.35 0 1 0 0-6.7 3.35 3.35 0 0 0 0 6.7zm5.406-8.72a1.207 1.207 0 1 1 0-2.414 1.207 1.207 0 0 1 0 2.414z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function Socials() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href="https://www.instagram.com/inespnj/"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/90 backdrop-blur transition-all hover:border-neon-pink hover:bg-neon-pink/10 hover:text-white hover:shadow-glow-pink"
        aria-label="Suivre InesPNJ sur Instagram"
      >
        <InstagramIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
        <span>Instagram</span>
      </a>
      <a
        href="https://discord.gg/qdvuaat6UP"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/90 backdrop-blur transition-all hover:border-neon-blue hover:bg-neon-blue/10 hover:text-white hover:shadow-glow"
        aria-label="Rejoindre le Discord d'InesPNJ"
      >
        <DiscordIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
        <span>Discord</span>
      </a>
      <a
        href="https://streamlabscharity.com/teams/@living-the-dream-2026/living-the-dream-2026?member=883764207819036315&l=fr-FR"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-full border-2 border-neon-pink bg-gradient-to-r from-neon-pink via-fuchsia-500 to-neon-yellow px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-glow-pink transition-all hover:scale-105 hover:shadow-glow-pink sm:text-base"
        aria-label="Faire un don à InesPNJ via Streamlabs Charity"
      >
        <HeartIcon className="h-4 w-4 transition-transform group-hover:scale-125 sm:h-5 sm:w-5" />
        <span>Faire un don</span>
      </a>
    </div>
  );
}
