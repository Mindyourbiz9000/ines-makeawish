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

  const total = goals.length;
  const pct = total > 0 ? (totalDone / total) * 100 : 0;

  return (
    <>
      {showCounter && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[12px] text-white/55">
            <span className="tabular-nums">
              <span className="font-semibold text-white">{totalDone}</span> /{" "}
              {total} paliers
            </span>
            <span className="tabular-nums">{Math.round(pct)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-yellow transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
      <ul className="space-y-2">
        {goals.map((goal) => {
          const isPending = pendingIds.has(goal.id);
          return (
            <li
              key={goal.id}
              className={`rounded-2xl border border-white/[0.06] bg-white/[0.015] transition ${
                goal.completed
                  ? "opacity-50"
                  : "hover:border-white/15 hover:bg-white/[0.04]"
              }`}
            >
              <label
                className={`flex w-full items-center gap-3 px-4 py-3.5 ${
                  editable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {editable ? (
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    disabled={isPending}
                    onChange={() => toggle(goal)}
                    className="h-5 w-5 shrink-0 cursor-pointer accent-neon-pink disabled:cursor-not-allowed"
                    aria-label={`Marquer "${goal.label}" comme ${
                      goal.completed ? "non fait" : "fait"
                    }`}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                      goal.completed
                        ? "border-neon-pink/40 text-neon-pink"
                        : "border-white/15 text-transparent"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      className="h-3 w-3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                <span className="flex min-w-0 flex-1 items-baseline gap-3">
                  <span
                    className={`min-w-0 flex-1 truncate text-[15px] ${
                      goal.completed ? "text-white/60" : "text-white/95"
                    }`}
                  >
                    {goal.label}
                  </span>
                  <span
                    className={`shrink-0 text-sm tabular-nums font-semibold ${
                      goal.completed ? "text-white/40" : "text-neon-yellow"
                    }`}
                  >
                    {goal.amount}€
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
