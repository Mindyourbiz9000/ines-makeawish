"use client";

import { useEffect, useState } from "react";

type Streamer = {
  name: string;
  amount: number;
};

type LeaderboardResponse = {
  streamers: Streamer[];
  fetchedAt: string;
};

const POLL_INTERVAL_MS = 10_000;

function formatEuros(amount: number): string {
  const formatted =
    Number.isInteger(amount) || amount % 1 < 0.005
      ? Math.round(amount).toLocaleString("fr-FR")
      : amount.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  return `${formatted}€`;
}

export default function Leaderboard() {
  const [streamers, setStreamers] = useState<Streamer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (!cancelled) setError(body.error ?? `HTTP ${res.status}`);
          return;
        }
        const body = (await res.json()) as LeaderboardResponse;
        if (!cancelled) {
          setStreamers(body.streamers ?? []);
          setFetchedAt(body.fetchedAt);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    tick();
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <h2 className="neon-title text-2xl sm:text-3xl">Top Streamers</h2>
        {fetchedAt && (
          <span className="text-[10px] uppercase tracking-widest text-white/40">
            Live · maj 10s
          </span>
        )}
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          Leaderboard indisponible: {error}
        </p>
      )}

      {!error && streamers === null && (
        <p className="text-sm text-white/50">Chargement du leaderboard…</p>
      )}

      {!error && streamers && streamers.length === 0 && (
        <p className="text-sm text-white/50">Pas encore de streamer classé.</p>
      )}

      {streamers && streamers.length > 0 && (
        <ol className="space-y-2">
          {streamers.map((streamer, i) => {
            const rank = i + 1;
            const medal =
              rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
            return (
              <li
                key={`${streamer.name}-${i}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                      rank <= 3
                        ? "bg-neon-pink/20 text-neon-pink"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {medal ?? rank}
                  </span>
                  <span className="truncate text-sm text-white sm:text-base">
                    {streamer.name}
                  </span>
                </div>
                <span className="shrink-0 font-semibold text-neon-yellow tabular-nums">
                  {formatEuros(streamer.amount)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
