"use client";

import { useEffect, useState } from "react";

type Streamer = { name: string; amount: number };
type LeaderboardResponse = { streamers: Streamer[] };

const STREAMER_NAME = "InesPNJ";
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

export default function InesStats() {
  const [rank, setRank] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as LeaderboardResponse;
        const idx = body.streamers.findIndex(
          (s) => s.name.toLowerCase() === STREAMER_NAME.toLowerCase()
        );
        if (!cancelled && idx !== -1) {
          setRank(idx + 1);
          setAmount(body.streamers[idx].amount);
        }
      } catch {
        // ignore — on retentera au prochain tick
      }
    }

    tick();
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (rank === null || amount === null) return null;

  const medal =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-neon-yellow/40 bg-neon-yellow/10 px-3 py-1.5 text-xs shadow-glow sm:text-sm">
      <span className="font-semibold text-neon-yellow">
        {medal ? `${medal} ` : ""}#{rank}
      </span>
      <span className="text-white/40">·</span>
      <span className="font-bold tabular-nums text-white">
        {formatEuros(amount)}
      </span>
      <span className="text-white/60">récoltés</span>
    </div>
  );
}
