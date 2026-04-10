"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type GoalRow = Database["public"]["Tables"]["donation_goals"]["Row"];

type Props = {
  initialGoals: GoalRow[];
  /** Si `true`, afficher des checkboxes interactives. La modification passe par l'API /api/goals. */
  editable?: boolean;
};

export default function GoalList({ initialGoals, editable = false }: Props) {
  const [goals, setGoals] = useState<GoalRow[]>(initialGoals);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  // Realtime: s'abonner aux changements de la table donation_goals.
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("donation_goals-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "donation_goals" },
        (payload) => {
          const updated = payload.new as GoalRow;
          setGoals((prev) =>
            prev.map((g) => (g.id === updated.id ? updated : g))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function toggle(goal: GoalRow) {
    if (!editable) return;
    const next = !goal.completed;

    // Optimistic update
    setGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? { ...g, completed: next } : g))
    );
    setPendingIds((prev) => new Set(prev).add(goal.id));

    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goal.id, completed: next }),
      });
      if (!res.ok) {
        // rollback
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goal.id ? { ...g, completed: goal.completed } : g
          )
        );
        const body = await res.json().catch(() => ({}));
        alert(`Erreur: ${body.error ?? res.statusText}`);
      }
    } catch (err) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goal.id ? { ...g, completed: goal.completed } : g
        )
      );
      alert(`Erreur réseau: ${(err as Error).message}`);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(goal.id);
        return next;
      });
    }
  }

  return (
    <ul className="space-y-3">
      {goals.map((goal) => {
        const isPending = pendingIds.has(goal.id);
        return (
          <li
            key={goal.id}
            className={`flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur transition-all ${
              goal.completed ? "opacity-60" : "hover:border-neon-blue/60 hover:bg-white/10"
            }`}
          >
            <label className="flex w-full cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={goal.completed}
                disabled={!editable || isPending}
                onChange={() => toggle(goal)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-neon-pink disabled:cursor-not-allowed"
                aria-label={`Marquer "${goal.label}" comme ${
                  goal.completed ? "non fait" : "fait"
                }`}
              />
              <span className="flex flex-wrap items-baseline gap-x-2 text-base sm:text-lg">
                <span className="font-bold text-neon-yellow tabular-nums">
                  {goal.amount}€
                </span>
                <span className="text-white/50">~</span>
                <span
                  className={`text-white ${
                    goal.completed ? "line-through decoration-neon-pink decoration-2" : ""
                  }`}
                >
                  {goal.label}
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
