import type { Metadata } from "next";
import { Monoton } from "next/font/google";
import styles from "./bercy.module.css";

const monoton = Monoton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-monoton",
  display: "swap",
});

// Page accessible uniquement via l'URL directe : pas de lien depuis
// l'accueil et pas d'indexation par les moteurs de recherche.
export const metadata: Metadata = {
  title: "Ines Land · 2028",
  description:
    "Ines Land : une nuit disco géante, 20 000 personnes, DJ surprise aux platines. Paris, 2028.",
  robots: { index: false, follow: false },
};

const SPARKLES = [
  { top: "12%", left: "8%", delay: "0s" },
  { top: "22%", left: "88%", delay: "0.4s" },
  { top: "38%", left: "18%", delay: "1.1s" },
  { top: "8%", left: "64%", delay: "1.6s" },
  { top: "46%", left: "78%", delay: "0.8s" },
  { top: "30%", left: "40%", delay: "1.9s" },
  { top: "58%", left: "6%", delay: "0.2s" },
  { top: "64%", left: "94%", delay: "1.3s" },
  { top: "18%", left: "30%", delay: "2.1s" },
  { top: "52%", left: "56%", delay: "0.6s" },
];

const EQ_BARS = [0, 0.15, 0.3, 0.05, 0.45, 0.2, 0.6, 0.1, 0.35, 0.25, 0.5, 0.4];

const STATS = [
  { value: "20 000", label: "danseurs", tone: "neonBlue" },
  { value: "1", label: "nuit mythique", tone: "neonPurple" },
  { value: "1", label: "DJ légendaire", tone: "neonBlue" },
  { value: "∞", label: "paillettes", tone: "neonPurple" },
] as const;

const PROGRAMME = [
  {
    emoji: "🚪",
    title: "Ouverture des portes",
    text: "Paillettes à l'entrée, néons partout, la boule à facettes s'allume.",
  },
  {
    emoji: "🕺",
    title: "Warm-up disco",
    text: "Funk, disco et classiques qui font bouger les épaules de toute l'arène.",
  },
  {
    emoji: "🎧",
    title: "Le DJ mystère aux platines",
    text: "Le set principal. 20 000 personnes, un seul dancefloor géant.",
  },
  {
    emoji: "🎉",
    title: "Grand final",
    text: "Pluie de confettis, lasers à fond et un dernier morceau dont tout Paris va parler.",
  },
];

const MARQUEE =
  "INES LAND ✦ PARIS ✦ 2028 ✦ DJ MYSTÈRE ✦ 20 000 PERSONNES ✦ LEBARV LOVE BUS ✦ LIEU SECRET ✦ DISCO NIGHT ✦ ";

export default function BercyPage() {
  return (
    <div className={`${monoton.variable} ${styles.page}`}>
      <div className={styles.lasers} aria-hidden="true">
        <span className={styles.laser} />
        <span className={styles.laser} />
        <span className={styles.laser} />
        <span className={styles.laser} />
        <span className={styles.laser} />
      </div>
      <div className={styles.floor} aria-hidden="true" />
      <div className={styles.sparkles} aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className={styles.sparkle}
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          />
        ))}
      </div>

      <main className="relative mx-auto max-w-4xl px-4 pb-16 sm:pb-24">
        {/* Hero */}
        <section className="flex flex-col items-center text-center">
          <div className={styles.ballWrap} aria-hidden="true">
            <div className={styles.string} />
            <div className={styles.ball} />
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.45em] text-white/70 sm:text-sm">
            Paris · 2028
          </p>

          <h1
            className={`${styles.title} mt-5 text-6xl sm:text-8xl md:text-9xl`}
          >
            Ines Land
          </h1>

          <p className="mt-6 max-w-xl text-base text-white/80 sm:text-lg">
            La plus grande soirée disco jamais organisée par la commu.{" "}
            <span className={`${styles.rainbowText} font-bold`}>
              20 000 personnes
            </span>
            , une arène entière transformée en dancefloor, et un{" "}
            <span className="font-bold text-white">DJ mystère</span> aux
            platines.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-neon-pink via-purple-500 to-neon-blue px-7 py-3 text-base font-bold uppercase tracking-wide text-white shadow-glow-pink sm:px-9 sm:py-4 sm:text-lg">
              <span aria-hidden="true">🎟️</span>
              Prévente en ligne bientôt
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">
              Restez connectés, ça va partir vite
            </span>
          </div>
        </section>

        {/* Bandeau défilant */}
        <div
          className="relative -mx-4 mt-14 overflow-hidden border-y border-white/10 bg-black/40 py-3 sm:mt-20"
          aria-hidden="true"
        >
          <div className={styles.marquee}>
            {[0, 1].map((i) => (
              <span
                key={i}
                className={`${styles.rainbowText} whitespace-nowrap text-lg font-black tracking-[0.25em] sm:text-2xl`}
              >
                {MARQUEE.repeat(3)}
              </span>
            ))}
          </div>
        </div>

        {/* Chiffres */}
        <section className="mt-14 grid grid-cols-2 gap-4 sm:mt-20 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={i}
              className={`${styles.neonCard} flex flex-col items-center px-3 py-6 text-center`}
            >
              <span
                className={`${styles[s.tone]} whitespace-nowrap text-4xl font-black sm:text-4xl md:text-5xl`}
              >
                {s.value}
              </span>
              <span className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">
                {s.label}
              </span>
            </div>
          ))}
        </section>

        {/* DJ mystère */}
        <section className="mt-16 sm:mt-24">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.45em] text-white/60 sm:text-sm">
            Aux platines
          </h2>
          <div
            className={`${styles.neonCard} mt-6 flex flex-col items-center gap-8 px-6 py-10 sm:flex-row sm:px-10`}
          >
            <div className={styles.vinyl} aria-hidden="true" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.35em] text-neon-pink">
                Headliner
              </p>
              <h3
                className={`${styles.title} mt-3 text-5xl sm:text-6xl`}
              >
                DJ ???
              </h3>
              <p className="mt-4 text-white/80">
                Le nom reste secret pour l&apos;instant. Disco, funk, house et
                gros classiques remixés : un set taillé pour faire danser
                20 000 personnes jusqu&apos;au dernier beat. Révélation
                bientôt.
              </p>
              <div
                className={`${styles.eq} mt-6 justify-center sm:justify-start`}
                aria-hidden="true"
              >
                {EQ_BARS.map((d, i) => (
                  <span key={i} style={{ animationDelay: `-${d}s` }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Programme */}
        <section className="mt-16 sm:mt-24">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.45em] text-white/60 sm:text-sm">
            Le programme de la nuit
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {PROGRAMME.map((step, i) => (
              <li
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-all hover:border-neon-pink/60 hover:shadow-glow-pink"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {step.emoji}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-neon-blue">
                    Acte {i + 1}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-white/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Lieu + dress code */}
        <section className="mt-16 grid gap-4 sm:mt-24 sm:grid-cols-2">
          <div className={`${styles.neonCard} p-6 sm:p-8`}>
            <p className="text-xs uppercase tracking-[0.35em] text-neon-pink">
              Le lieu
            </p>
            <h3 className={`${styles.neonBlue} mt-3 text-3xl font-black`}>
              Annoncé bientôt
            </h3>
            <p className="mt-3 text-white/80">
              Une arène géante à Paris, capable d&apos;accueillir 20 000
              danseurs. Le lieu exact sera dévoilé plus tard.
            </p>
            <p className="mt-3 text-sm text-white/60">
              Restez connectés pour la révélation
            </p>
          </div>
          <div className={`${styles.neonCard} p-6 sm:p-8`}>
            <p className="text-xs uppercase tracking-[0.35em] text-neon-pink">
              Dress code
            </p>
            <h3 className={`${styles.neonPurple} mt-3 text-3xl font-black`}>
              Disco obligatoire
            </h3>
            <p className="mt-3 text-white/80">
              Paillettes, pattes d&apos;eph, lunettes en cœur, néons fluo. Plus
              tu brilles, mieux c&apos;est.
            </p>
            <p className="mt-3 text-2xl" aria-hidden="true">
              🪩 ✨ 🕺 💃 ✨ 🪩
            </p>
          </div>
        </section>

        {/* Love Bus */}
        <section className="mt-16 sm:mt-24">
          <div
            className={`${styles.neonCard} overflow-hidden px-6 py-10 text-center sm:px-10`}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-neon-pink">
              Transport officiel
            </p>
            <h2 className={`${styles.title} mt-4 text-5xl sm:text-7xl`}>
              LeBarv Love Bus
            </h2>
            <div className={`${styles.busTrack} relative mt-6 h-16 overflow-hidden`} aria-hidden="true">
              <span className={`${styles.bus} absolute top-0 text-5xl`}>
                🚌💖
              </span>
            </div>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Le LeBarv Love Bus débarque pour amener tout le monde au show. Rose,
              néon, musique à fond dès le départ : la fête commence dans le bus
              et ne s&apos;arrête qu&apos;au pied de l&apos;arène.
            </p>
            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-white/60">
              Trajets et points de départ annoncés bientôt
            </p>
          </div>
        </section>

        {/* Sécurité */}
        <section className="mt-16 sm:mt-24">
          <div
            className={`${styles.neonCard} flex flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:px-10 sm:text-left`}
          >
            <span className={`${styles.shield} text-6xl`} aria-hidden="true">
              🛡️
            </span>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-neon-pink">
                Sécurité
              </p>
              <h2 className={`${styles.neonBlue} mt-3 text-3xl font-black sm:text-4xl`}>
                Une équipe aux petits soins
              </h2>
              <p className="mt-3 text-white/80">
                Une équipe sécu veille sur les 20 000 danseurs, pour que la
                seule chose qui déborde ce soir-là soit la piste de danse.
              </p>
            </div>
          </div>
        </section>

        {/* Final */}
        <section className="mt-16 text-center sm:mt-24">
          <p className={`${styles.title} text-4xl sm:text-6xl`}>
            On se voit en 2028
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.35em] text-white/60">
            Ines Land · 2028 · Prévente en ligne bientôt
          </p>
        </section>
      </main>
    </div>
  );
}
