"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BirthdayCountdown.module.css";

// Fête plein écran au passage de minuit : canons à confettis, flash et
// grand message néon, puis une pluie de confettis légère pour la journée.

const DONATE_URL = "https://streamelements.com/inespnj/tip";

// Gros bouton de don, partagé par le bandeau et la fête plein écran.
export function GiftButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`${styles.giftButton} ${className} inline-flex items-center gap-3 rounded-full px-8 py-4 text-lg font-extrabold uppercase tracking-wide text-white sm:px-12 sm:py-5 sm:text-2xl`}
    >
      <span aria-hidden="true">🎁</span>
      Régalez Inès
    </a>
  );
}

// GIF "Happy birthday" dans un cadre néon, affiché les 10 premières minutes.
export function BirthdayGif({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.gifFrame} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/birthday/happy-birthday.gif"
        alt="Happy birthday"
        width={268}
        height={150}
        className="block h-auto w-full rounded-[14px]"
      />
      <span className={styles.gifTint} aria-hidden="true" />
    </div>
  );
}

const COLORS = [
  "#ff3aa6",
  "#4ad6ff",
  "#c084fc",
  "#ff9ed1",
  "#a855f7",
  "#ffffff",
  "#f472b6",
];

const AMBIENT = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  color: COLORS[i % COLORS.length],
  duration: `${6 + ((i * 7) % 6)}s`,
  delay: `-${(i * 13) % 11}s`,
}));

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  wobble: number;
};

function burst(
  list: Particle[],
  count: number,
  x: number,
  y: number,
  angle: number,
  spread: number,
  speed: number,
) {
  for (let i = 0; i < count; i++) {
    const a = angle + (Math.random() - 0.5) * spread;
    const v = speed * (0.55 + Math.random() * 0.6);
    list.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
    });
  }
}

function ConfettiCannons() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const scale = Math.max(0.6, Math.min(1.4, W() / 1000));
    const n = reduced ? 0.25 : 1;
    const particles: Particle[] = [];

    // Vagues successives : canons gauche/droite puis explosions au centre.
    const waves: [number, () => void][] = [
      [
        0,
        () => {
          burst(particles, 160 * n, 0, H(), -Math.PI / 3, 0.7, 22 * scale);
          burst(
            particles,
            160 * n,
            W(),
            H(),
            (-2 * Math.PI) / 3,
            0.7,
            22 * scale,
          );
        },
      ],
      [
        350,
        () =>
          burst(
            particles,
            220 * n,
            W() / 2,
            H() * 0.45,
            0,
            Math.PI * 2,
            17 * scale,
          ),
      ],
      [
        1100,
        () => {
          burst(
            particles,
            120 * n,
            0,
            H() * 0.8,
            -Math.PI / 4,
            0.6,
            20 * scale,
          );
          burst(
            particles,
            120 * n,
            W(),
            H() * 0.8,
            (-3 * Math.PI) / 4,
            0.6,
            20 * scale,
          );
        },
      ],
      [
        1900,
        () => {
          burst(
            particles,
            140 * n,
            W() * 0.25,
            H() * 0.35,
            0,
            Math.PI * 2,
            13 * scale,
          );
          burst(
            particles,
            140 * n,
            W() * 0.75,
            H() * 0.35,
            0,
            Math.PI * 2,
            13 * scale,
          );
        },
      ],
      [
        3000,
        () =>
          burst(
            particles,
            200 * n,
            W() / 2,
            -20,
            Math.PI / 2,
            Math.PI,
            8 * scale,
          ),
      ],
    ];
    const timers = waves.map(([t, fn]) => setTimeout(fn, t));

    let raf = 0;
    let last = performance.now();
    const start = last;
    const tick = (t: number) => {
      const dt = Math.min(2, (t - last) / 16.67);
      last = t;
      ctx.clearRect(0, 0, W(), H());
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.35 * dt;
        p.wobble += 0.1 * dt;
        p.x += (p.vx + Math.sin(p.wobble) * 0.8) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.y > H() + 40) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.wobble));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      // On s'arrête quand toutes les vagues sont passées et retombées.
      if (particles.length > 0 || t - start < 3500) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
      aria-hidden="true"
    />
  );
}

const SEEN_KEY = "ines-birthday-party";

export default function BirthdayParty({
  showGif = false,
}: {
  showGif?: boolean;
}) {
  // La grosse fête ne se joue qu'une fois par onglet ; la pluie légère reste.
  const [fresh] = useState(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return false;
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Stockage indisponible : on joue la fête quand même.
    }
    return true;
  });
  const [splash, setSplash] = useState(fresh);

  useEffect(() => {
    const id = setTimeout(() => setSplash(false), 8000);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {fresh ? <ConfettiCannons /> : null}

      {splash ? (
        <div
          className={`${styles.splash} fixed inset-0 z-50 flex cursor-pointer items-center justify-center px-4 text-center`}
          onClick={() => setSplash(false)}
          role="dialog"
          aria-label="Joyeux anniversaire Inès"
        >
          <div className={styles.flash} aria-hidden="true" />
          <div className="relative flex flex-col items-center">
            {showGif ? (
              <BirthdayGif className="w-[min(360px,82vw)]" />
            ) : (
              <div
                className={`${styles.ball} ${styles.ballBig}`}
                aria-hidden="true"
              />
            )}
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.5em] text-neon-blue sm:text-base">
              3 novembre · minuit
            </p>
            <h2
              className={`${styles.title} ${styles.splashTitle} mt-4 text-6xl leading-tight sm:text-8xl lg:text-9xl`}
            >
              Joyeux anniversaire Inès !
            </h2>
            <p className="mt-6 text-xl font-bold sm:text-3xl">
              🎂{" "}
              <span className={styles.rainbow}>
                Tout le monde sur le dancefloor
              </span>{" "}
              🪩
            </p>
            <GiftButton className="mt-10" />
          </div>
        </div>
      ) : null}

      {/* Pluie de confettis légère pour le reste de la journée */}
      <div
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        aria-hidden="true"
      >
        {AMBIENT.map((c, i) => (
          <span
            key={i}
            className={`${styles.confetti} ${styles.ambient}`}
            style={{
              left: c.left,
              background: c.color,
              animationDuration: c.duration,
              animationDelay: c.delay,
            }}
          />
        ))}
      </div>
    </>
  );
}

// Les 10 dernières secondes en très grand, plein écran.
export function FinalCountdown({ seconds }: { seconds: number }) {
  return (
    <div
      className={`${styles.finalOverlay} pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center`}
      aria-live="assertive"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.5em] text-neon-blue sm:text-base">
        Anniversaire d&apos;Inès dans
      </p>
      <span
        key={seconds}
        className={`${styles.digit} ${styles.finalDigit} font-heading font-extrabold leading-none`}
      >
        {seconds}
      </span>
    </div>
  );
}
