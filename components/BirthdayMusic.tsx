"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BirthdayCountdown.module.css";

// "Baby" (clip officiel YouTube) en boucle pour l'anniversaire.
// Les navigateurs bloquent le son tant que la personne n'a pas touché la
// page : on tente de lancer la vidéo tout de suite, sinon au premier
// clic/tap, avec un bouton flottant bien visible.
const VIDEO_ID = "GqWYJT-iMTw";

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  unMute: () => void;
  setVolume: (v: number) => void;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Charge l'API IFrame YouTube une seule fois.
function loadYouTubeApi(): Promise<YTNamespace> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

export default function BirthdayMusic() {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [playing, setPlaying] = useState(false);
  // Passe à true si la personne met en pause : on ne relance plus tout seul.
  const userPaused = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const tryPlay = () => {
      const player = playerRef.current;
      if (!player || userPaused.current) return;
      player.unMute();
      player.playVideo();
    };

    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return;
      playerRef.current = new YT.Player(hostRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: VIDEO_ID,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            playerRef.current?.setVolume(70);
            tryPlay();
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
            else if (e.data === YT.PlayerState.PAUSED) setPlaying(false);
          },
        },
      });
    });

    window.addEventListener("pointerdown", tryPlay);
    window.addEventListener("keydown", tryPlay);
    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  const toggle = (e: React.MouseEvent) => {
    // Le clic ne doit pas aussi déclencher l'écouteur global.
    e.stopPropagation();
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      userPaused.current = true;
      player.pauseVideo();
    } else {
      userPaused.current = false;
      player.unMute();
      player.playVideo();
    }
  };

  // Mini-lecteur flottant : 200×200 px, la taille minimale autorisée par
  // YouTube pour un lecteur intégré.
  return (
    <div className="fixed bottom-28 right-4 z-[70] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <div className={styles.videoFrame}>
        <div className="relative h-[200px] w-[200px] overflow-hidden rounded-[12px] bg-black">
          <div ref={hostRef} className="absolute inset-0 h-full w-full" />
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        onPointerDown={(e) => e.stopPropagation()}
        className={`${styles.musicButton} ${playing ? "" : styles.musicMuted} inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white sm:text-sm`}
        aria-pressed={playing}
        aria-label={playing ? "Mettre la musique en pause" : "Mettre le son"}
      >
        {playing ? (
          <>
            <span className={styles.musicEq} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>Baby · Justin Bieber</span>
            <span aria-hidden="true">⏸</span>
          </>
        ) : (
          <>
            <span aria-hidden="true">🔊</span>
            <span>Mets le son</span>
          </>
        )}
      </button>
    </div>
  );
}
