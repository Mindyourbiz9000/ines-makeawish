"use client";

import { useEffect, useState } from "react";
import type { Database } from "@/lib/supabase/types";

type GoalRow = Database["public"]["Tables"]["donation_goals"]["Row"];

type Props = {
  initialGoals: GoalRow[];
  /** Si `true`, afficher des checkboxes interactives. La modification passe par l'API /api/goals. */
  editable?: boolean;
  /** Si `true`, afficher un compteur "X / Y paliers débloqués" au-dessus de la liste. */
  showCounter?: boolean;
};

const POLL_INTERVAL_MS = 3000;

export default function GoalList({
  initialGoals,
  editable = false,
  showCounter = false,
}: Props) {
  const [goals, setGoals] = useState<GoalRow[]>(initialGoals);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const totalDone = goals.filter((g) => g.completed).length;

  // Polling: on refetch toute la liste toutes les 3s pour avoir les updates.
  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/goals", { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as { goals: GoalRow[] };
        if (!cancelled && Array.isArray(body.goals)) {
          setGoals((prev) => {
            // Ne pas écraser un palier qui est en train d'être toggle côté client.
            return body.goals.map((g) =>
              pendingIds.has(g.id) ? prev.find((p) => p.id === g.id) ?? g : g
            );
          });
        }
      } catch {
        // ignore (réseau instable, on retentera au prochain tick)
      }
    }

    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pendingIds]);

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
    <>
      {showCounter && (
        <p className="mb-6 text-center text-white/70">
          <span className="tabular-nums font-semibold text-white">
            {totalDone}
          </span>{" "}
          / {goals.length} paliers déjà fait
        </p>
      )}
      <ul className="space-y-3">
        {goals.map((goal) => {
          const isPending = pendingIds.has(goal.id);
          return (
            <li
              key={goal.id}
              className={`flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur transition-all ${
                goal.completed
                  ? "opacity-60"
                  : "hover:border-neon-blue/60 hover:bg-white/10"
              }`}
            >
              <label
                className={`flex w-full items-start gap-3 ${
                  editable ? "cursor-pointer" : "cursor-default"
                }`}
              >
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
                      goal.completed
                        ? "line-through decoration-neon-pink decoration-2"
                        : ""
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
    </>
  );
}
