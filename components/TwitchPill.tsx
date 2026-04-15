"use client";

import { useEffect, useState } from "react";

type TwitchStatus = {
  followers: number;
  isLive: boolean;
};

const POLL_INTERVAL_MS = 60_000;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  );
}

export default function TwitchPill({ initial }: { initial: TwitchStatus }) {
  const [status, setStatus] = useState<TwitchStatus>(initial);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/twitch-status", { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as TwitchStatus;
        if (!cancelled) setStatus(body);
      } catch {
        // ignore — on retente au prochain tick
      }
    }

    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const { followers, isLive } = status;

  return (
    <a
      href="https://www.twitch.tv/inespnj"
      target="_blank"
      rel="noopener noreferrer"
      className={
        isLive
          ? "group inline-flex items-center gap-1.5 rounded-full border border-red-500/70 bg-red-500/10 px-3 py-1 text-xs text-white backdrop-blur transition-all hover:bg-red-500/20 hover:shadow-[0_0_18px_rgba(239,68,68,0.6)]"
          : "group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/90 backdrop-blur transition-all hover:border-[#9146FF] hover:bg-[#9146FF]/15 hover:text-white hover:shadow-[0_0_18px_rgba(145,70,255,0.5)]"
      }
      aria-label={
        isLive
          ? "InesPNJ est en live sur Twitch"
          : "Suivre InesPNJ sur Twitch"
      }
    >
      {isLive ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
      ) : (
        <TwitchIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
      )}
      <span>{isLive ? "LIVE" : "Twitch"}</span>
      <span
        className={
          isLive
            ? "ml-0.5 rounded-full bg-red-500/30 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white"
            : "ml-0.5 rounded-full bg-[#9146FF]/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white/90"
        }
      >
        {formatCount(followers)}
      </span>
    </a>
  );
}
