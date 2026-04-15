import { createServerClient } from "@/lib/supabase/server";
import GoalList from "@/components/GoalList";
import Socials from "@/components/Socials";
import Leaderboard from "@/components/Leaderboard";
import InesStats from "@/components/InesStats";
import InesTotal from "@/components/InesTotal";

// Toujours rendre côté serveur à la demande (pas de cache).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("donation_goals")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="neon-title text-5xl">InesPNJ · Donation goals</h1>
        <p className="mt-8 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-red-200">
          Impossible de charger les paliers: {error.message}
        </p>
      </main>
    );
  }

  const goals = data ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-8 flex items-center gap-5 sm:gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/inespnjv2.png"
          alt="Avatar d'InesPNJ"
          className="h-20 w-20 shrink-0 rounded-full border-4 border-neon-pink object-cover shadow-glow-pink sm:h-24 sm:w-24"
        />
        <div className="flex min-w-0 flex-col">
          <h1 className="neon-title text-4xl leading-none sm:text-5xl">
            InesPNJ
          </h1>
          <div className="mt-3">
            <Socials />
          </div>
        </div>
      </header>

      <section className="relative mb-10 overflow-hidden rounded-2xl border-2 border-neon-pink bg-gradient-to-br from-neon-pink/25 via-fuchsia-500/15 to-neon-yellow/25 px-5 py-8 text-center shadow-glow-pink sm:px-8 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 15% 30%, #ffd84a, transparent), radial-gradient(1.5px 1.5px at 80% 20%, #ff3aa6, transparent), radial-gradient(1.5px 1.5px at 30% 80%, #4ad6ff, transparent), radial-gradient(1.5px 1.5px at 70% 75%, #ffd84a, transparent), radial-gradient(1.5px 1.5px at 50% 50%, #ff3aa6, transparent)",
            backgroundSize: "300px 300px",
          }}
          aria-hidden="true"
        />
        <p className="relative neon-title text-4xl leading-tight sm:text-6xl">
          Now it&apos;s time to
          <br />
          free InesPNJ !
        </p>
        <p className="relative mx-auto mt-4 max-w-md text-sm text-white/80 sm:text-base">
          L&apos;event Make-A-Wish est terminé — place aux tips pour
          soutenir Ines directement.
        </p>
        <a
          href="https://streamelements.com/inespnj/tip"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative mt-6 inline-flex items-center gap-3 rounded-full border-2 border-neon-pink bg-gradient-to-r from-neon-pink via-fuchsia-500 to-neon-yellow px-6 py-3 text-base font-bold uppercase tracking-wide text-white shadow-glow-pink transition-all hover:scale-110 hover:shadow-[0_0_40px_rgba(255,58,166,0.7)] sm:px-8 sm:py-4 sm:text-lg"
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="h-5 w-5 transition-transform group-hover:scale-125 sm:h-6 sm:w-6"
            aria-hidden="true"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>Faire un don</span>
        </a>
      </section>

      <div
        className="my-12 h-[2px] w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #ff3aa6 20%, #ffd84a 50%, #4ad6ff 80%, transparent 100%)",
          boxShadow: "0 0 12px rgba(255, 58, 166, 0.6)",
        }}
        aria-hidden="true"
      />

      <section className="mt-10">
        <div className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neon-blue/80 sm:text-xs">
            Living the dream · Make-A-Wish
          </p>
          <h2 className="neon-title mt-1 text-3xl sm:text-4xl">
            Donation goals
          </h2>
          <div className="mt-3 flex justify-center">
            <InesStats />
          </div>
        </div>

        <section className="relative mb-8 overflow-hidden rounded-2xl border-2 border-neon-pink bg-gradient-to-br from-neon-pink/20 via-fuchsia-500/10 to-neon-yellow/20 px-5 py-6 text-center shadow-glow-pink sm:px-8 sm:py-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(1.5px 1.5px at 15% 30%, #ffd84a, transparent), radial-gradient(1.5px 1.5px at 80% 20%, #ff3aa6, transparent), radial-gradient(1.5px 1.5px at 30% 80%, #4ad6ff, transparent), radial-gradient(1.5px 1.5px at 70% 75%, #ffd84a, transparent), radial-gradient(1.5px 1.5px at 50% 50%, #ff3aa6, transparent)",
              backgroundSize: "300px 300px",
            }}
            aria-hidden="true"
          />
          <p className="relative neon-title text-2xl leading-tight sm:text-4xl">
            ✨ Merci à tous ✨
          </p>
          <p className="relative mt-3 text-base font-semibold uppercase tracking-wider text-white sm:text-lg">
            L&apos;event est fini, vous êtes des{" "}
            <span className="text-neon-yellow">GOAT</span> !
          </p>
          <div className="relative">
            <InesTotal />
            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/60 sm:text-xs">
              Total récolté par InesPNJ
            </p>
          </div>
          <p className="relative mt-4 text-sm text-white/90 sm:text-base">
            Special shout out à{" "}
            <span className="neon-title text-xl sm:text-2xl">Jozy</span>{" "}
            <span className="text-neon-pink">♥</span>
          </p>
          <a
            href="https://www.twitch.tv/inespnj/videos?category=509663&filter=archives"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative mt-5 inline-flex items-center gap-2 rounded-full border-2 border-[#9146FF] bg-[#9146FF]/15 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-[#9146FF]/30 hover:shadow-[0_0_25px_rgba(145,70,255,0.6)] sm:text-base"
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="h-4 w-4 text-[#b794ff] transition-transform group-hover:scale-110 sm:h-5 sm:w-5"
              aria-hidden="true"
            >
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
            </svg>
            <span>Les rediffs sont ici</span>
          </a>
        </section>

        <GoalList initialGoals={goals} showCounter />

        <Leaderboard />
      </section>
    </main>
  );
}
