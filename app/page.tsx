import { createServerClient } from "@/lib/supabase/server";
import GoalList from "@/components/GoalList";

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
        <h1 className="neon-title text-5xl">Donation goals</h1>
        <p className="mt-8 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-red-200">
          Impossible de charger les paliers: {error.message}
        </p>
      </main>
    );
  }

  const goals = data ?? [];
  const totalDone = goals.filter((g) => g.completed).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="neon-title text-6xl sm:text-7xl">Donation goals</h1>
        <p className="mt-3 text-sm uppercase tracking-[0.35em] text-neon-blue/80">
          Living the dream · Make-A-Wish
        </p>
        <p className="mt-6 text-white/70">
          {totalDone} / {goals.length} paliers débloqués
        </p>
      </header>

      <GoalList initialGoals={goals} editable={false} />

      <footer className="mt-12 text-center text-xs text-white/40">
        <a
          href="/admin"
          className="transition-colors hover:text-neon-blue"
        >
          Mode admin
        </a>
      </footer>
    </main>
  );
}
