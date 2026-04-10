import { createServerClient } from "@/lib/supabase/server";
import GoalList from "@/components/GoalList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("donation_goals")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="neon-title text-5xl">Admin</h1>
        <p className="mt-8 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-red-200">
          Impossible de charger les paliers: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10 flex flex-col items-center gap-2 text-center">
        <h1 className="neon-title text-5xl sm:text-6xl">InesPNJ · Admin</h1>
        <p className="text-white/70">
          Coche les paliers au fur et à mesure — les viewers voient les
          changements en direct (rafraîchissement toutes les 3s).
        </p>
      </header>

      <GoalList initialGoals={data ?? []} editable />
    </main>
  );
}
