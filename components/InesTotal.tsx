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

export default function InesTotal() {
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as LeaderboardResponse;
        const match = body.streamers.find(
          (s) => s.name.toLowerCase() === STREAMER_NAME.toLowerCase()
        );
        if (!cancelled && match) {
          setAmount(match.amount);
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

  return (
    <div className="relative mt-5 flex items-center justify-center gap-3 sm:gap-4">
      <span
        className="text-2xl sm:text-4xl"
        style={{ filter: "drop-shadow(0 0 8px #ffd84a)" }}
        aria-hidden="true"
      >
        ⭐
      </span>
      <span
        className="neon-title text-4xl leading-none tabular-nums sm:text-6xl"
        style={{
          color: "#fff6c2",
          textShadow:
            "0 0 8px #ffd84a, 0 0 18px #ffb347, 0 0 32px #ff3aa6",
        }}
      >
        {amount === null ? "…" : formatEuros(amount)}
      </span>
      <span
        className="text-2xl sm:text-4xl"
        style={{ filter: "drop-shadow(0 0 8px #ffd84a)" }}
        aria-hidden="true"
      >
        ⭐
      </span>
    </div>
  );
}
