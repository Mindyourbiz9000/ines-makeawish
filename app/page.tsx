import { createServerClient } from "@/lib/supabase/server";
import GoalList from "@/components/GoalList";
import Socials from "@/components/Socials";

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
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10 flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/inespnj.png"
          alt="Avatar d'InesPNJ"
          className="mb-5 h-28 w-28 rounded-full border-4 border-neon-pink object-cover shadow-glow-pink"
        />
        <h1 className="neon-title text-6xl sm:text-7xl">InesPNJ</h1>
        <p className="mt-2 text-2xl text-white/90 sm:text-3xl">Donation goals</p>
        <p className="mt-3 text-sm uppercase tracking-[0.35em] text-neon-blue/80">
          Living the dream · Make-A-Wish
        </p>
        <div className="mt-6">
          <Socials />
        </div>
      </header>

      <GoalList initialGoals={goals} editable showCounter />
    </main>
  );
}
