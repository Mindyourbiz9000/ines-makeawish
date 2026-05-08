"use client";

import { useEffect, useState } from "react";

type TwitchStatus = {
  followers: number;
  isLive: boolean;
};

const POLL_INTERVAL_MS = 60_000;

function formatCount(n: number): string {
  // Affiche le count entier avec séparateurs français : 14 670
  return n.toLocaleString("fr-FR");
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
          ? "group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#9146FF] bg-[#9146FF]/25 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-[#9146FF]/35"
          : "group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#9146FF]/70 bg-[#9146FF]/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-[#9146FF]/25"
      }
      aria-label={
        isLive
          ? "InesPNJ est en live sur Twitch"
          : "Suivre InesPNJ sur Twitch"
      }
    >
      <TwitchIcon className="h-4 w-4 shrink-0" />
      <span>Twitch</span>

      {/* Status dot : vert animé si live, rouge statique sinon */}
      {isLive ? (
        <span
          className="relative flex h-2.5 w-2.5 shrink-0"
          aria-label="En live"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-80" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
        </span>
      ) : (
        <span
          className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]"
          aria-label="Hors ligne"
        />
      )}

      {/* Follower count : badge bien visible */}
      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white">
        <span className="tabular-nums">{formatCount(followers)}</span>
        <span className="ml-1 font-semibold text-white/80">followers</span>
      </span>
    </a>
  );
}
