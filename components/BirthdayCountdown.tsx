"use client";

import { useEffect, useState } from "react";
import styles from "./BirthdayCountdown.module.css";
import BirthdayParty, { FinalCountdown, GiftButton } from "./BirthdayParty";

// Anniversaire d'Inès : minuit heure de Paris le 3 novembre 2026.
// La grosse fête plein écran se joue le 3 novembre ; le bandeau reste
// jusqu'à la fin du 7 novembre puis disparaît.
const BIRTHDAY = Date.parse("2026-11-03T00:00:00+01:00");
const BIRTHDAY_END = Date.parse("2026-11-04T00:00:00+01:00");
const BANNER_END = Date.parse("2026-11-08T00:00:00+01:00");

const COLORS = [
  "#ff3aa6",
  "#4ad6ff",
  "#c084fc",
  "#ff9ed1",
  "#a855f7",
  "#ffffff",
];

const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  color: COLORS[i % COLORS.length],
  duration: `${3 + ((i * 7) % 5)}s`,
  delay: `-${(i * 13) % 7}s`,
}));

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function BirthdayCountdown() {
  // null tant que le composant n'est pas monté (évite un écart SSR/client).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    // 4 ticks par seconde pour que minuit tombe pile.
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  if (now === null || now >= BANNER_END) return null;

  const isBirthday = now >= BIRTHDAY;
  const left = Math.max(0, BIRTHDAY - now);
  const totalSeconds = Math.floor(left / 1000);
  const finalSeconds = Math.ceil(left / 1000);
  const units = [
    { value: Math.floor(totalSeconds / 3600), label: "heures" },
    { value: Math.floor((totalSeconds % 3600) / 60), label: "minutes" },
    { value: totalSeconds % 60, label: "secondes" },
  ];

  return (
    <>
      {isBirthday && now < BIRTHDAY_END ? <BirthdayParty /> : null}
      {!isBirthday && finalSeconds <= 10 ? (
        <FinalCountdown seconds={finalSeconds} />
      ) : null}
      <section
        className={`${styles.wrap} mt-6 px-5 py-8 text-center sm:mt-10 sm:px-10 sm:py-12`}
        aria-live="polite"
      >
        <span className={styles.spot} aria-hidden="true" />
        <span className={styles.spot} aria-hidden="true" />
        {isBirthday
          ? CONFETTI.map((c, i) => (
              <span
                key={i}
                className={styles.confetti}
                style={{
                  left: c.left,
                  background: c.color,
                  animationDuration: c.duration,
                  animationDelay: c.delay,
                }}
                aria-hidden="true"
              />
            ))
          : null}

        <div className="relative flex flex-col items-center">
          <div className={styles.ball} aria-hidden="true" />

          {isBirthday ? (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-neon-blue sm:text-sm">
                3 novembre
              </p>
              <h2
                className={`${styles.title} mt-3 text-5xl leading-tight sm:text-7xl`}
              >
                Joyeux anniversaire Inès !
              </h2>
              <p className="mt-4 text-lg font-bold sm:text-2xl">
                🎂{" "}
                <span className={styles.rainbow}>
                  Tout le monde sur le dancefloor
                </span>{" "}
                🪩
              </p>
              <GiftButton className="mt-8" />
            </>
          ) : (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-neon-blue sm:text-sm">
                Compte à rebours
              </p>
              <h2
                className={`${styles.title} mt-3 text-4xl leading-tight sm:text-6xl`}
              >
                L&apos;anniversaire d&apos;Inès
              </h2>
              <div className="mt-8 flex items-start justify-center gap-2 sm:gap-4">
                {units.map((u, i) => (
                  <div
                    key={u.label}
                    className="flex items-start gap-2 sm:gap-4"
                  >
                    {i > 0 ? (
                      <span
                        className={`${styles.colon} pt-3 font-heading text-4xl font-extrabold sm:pt-5 sm:text-7xl`}
                        aria-hidden="true"
                      >
                        :
                      </span>
                    ) : null}
                    <div className="flex flex-col items-center">
                      <div
                        className={`${styles.tile} flex w-[84px] justify-center py-3 sm:w-[150px] sm:py-5`}
                      >
                        <span
                          // La clé change à chaque seconde pour relancer l'animation.
                          key={i === 2 ? u.value : undefined}
                          className={`${styles.digit} ${i === 2 ? styles.tick : ""} font-heading text-5xl font-extrabold leading-none sm:text-8xl`}
                        >
                          {pad(u.value)}
                        </span>
                      </div>
                      <span className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/60 sm:text-xs">
                        {u.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-base font-bold sm:text-xl">
                <span className={styles.rainbow}>
                  Minuit pile, on fait la fête
                </span>{" "}
                🪩
              </p>
              <GiftButton className="mt-8" />
            </>
          )}
        </div>
      </section>
    </>
  );
}
