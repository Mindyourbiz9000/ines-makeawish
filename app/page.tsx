import { createServerClient } from "@/lib/supabase/server";
import GoalList from "@/components/GoalList";
import Socials from "@/components/Socials";
import Leaderboard from "@/components/Leaderboard";
import InesStats from "@/components/InesStats";
import InesTotal from "@/components/InesTotal";
import Setup from "@/components/Setup";
import Questions from "@/components/Questions";

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

      <section className="relative mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center sm:px-8 sm:py-16">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50 sm:text-sm">
          Now it&apos;s time to
        </p>
        <h2 className="neon-title mt-3 text-5xl leading-none sm:text-7xl">
          #freeines
        </h2>
        <a
          href="https://streamelements.com/inespnj/tip"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-neon-pink to-neon-yellow px-6 py-3 text-base font-bold uppercase tracking-wide text-white shadow-glow-pink transition-all hover:scale-105 sm:px-8 sm:py-4 sm:text-lg"
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="h-5 w-5 sm:h-6 sm:w-6"
            aria-hidden="true"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>Faire un don</span>
        </a>
      </section>

      <div className="space-y-3">
        <Setup />
        <Questions />
      </div>

      <div
        className="my-16 h-[2px] w-full rounded-full sm:my-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #ff3aa6 20%, #ffd84a 50%, #4ad6ff 80%, transparent 100%)",
          boxShadow: "0 0 12px rgba(255, 58, 166, 0.6)",
        }}
        aria-hidden="true"
      />

      <section className="mt-10">
        <p className="mb-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/50 sm:text-xs">
          Living the dream · Make-A-Wish · Donation goals
        </p>

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 text-center sm:px-8 sm:py-8">
          <p className="text-xs uppercase tracking-[0.25em] text-white/50">
            Total récolté — merci à tous
          </p>
          <p className="mt-3 text-4xl leading-none sm:text-6xl">
            <InesTotal />
          </p>
          <div className="mt-4 flex justify-center">
            <InesStats />
          </div>
          <p className="mt-5 text-xs text-white/60 sm:text-sm">
            Shout-out à{" "}
            <span className="font-semibold text-white/90">Jozy</span>{" "}
            <span className="text-neon-pink">♥</span>
            {" · "}
            <a
              href="https://www.twitch.tv/inespnj/videos?category=509663&filter=archives"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              rediffs sur Twitch
            </a>
          </p>
        </section>

        <GoalList initialGoals={goals} showCounter />

        <Leaderboard />
      </section>
    </main>
  );
}
