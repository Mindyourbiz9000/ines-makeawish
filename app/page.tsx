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
      </section>

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
          <p className="mt-1 text-lg text-white/90 sm:text-xl">Donation goals</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-neon-blue/80 sm:text-xs">
            Living the dream · Make-A-Wish
          </p>
          <div className="mt-3">
            <Socials />
          </div>
          <InesStats />
        </div>
      </header>

      <GoalList initialGoals={goals} showCounter />

      <Leaderboard />
    </main>
  );
}
