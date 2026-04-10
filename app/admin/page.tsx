import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import GoalList from "@/components/GoalList";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const COOKIE_NAME = "ines_admin";

export default async function AdminPage() {
  const cookieStore = cookies();
  const adminCookie = cookieStore.get(COOKIE_NAME)?.value;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="neon-title text-4xl">Admin</h1>
        <p className="mt-6 text-red-300">
          ADMIN_PASSWORD n&apos;est pas défini dans les variables
          d&apos;environnement.
        </p>
      </main>
    );
  }

  if (adminCookie !== expected) {
    return <LoginForm />;
  }

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

  async function logout() {
    "use server";
    cookies().delete(COOKIE_NAME);
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10 flex flex-col items-center gap-4 text-center">
        <h1 className="neon-title text-5xl sm:text-6xl">Admin</h1>
        <p className="text-white/70">
          Coche les paliers au fur et à mesure — les viewers voient les changements en direct.
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-widest text-white/60 transition-colors hover:border-neon-pink hover:text-neon-pink"
          >
            Déconnexion
          </button>
        </form>
      </header>

      <GoalList initialGoals={data ?? []} editable />
    </main>
  );
}
