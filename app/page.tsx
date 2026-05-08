import { createServerClient } from "@/lib/supabase/server";
import GoalList from "@/components/GoalList";
import Socials from "@/components/Socials";
import TwitchPill from "@/components/TwitchPill";
import InesStats from "@/components/InesStats";
import InesTotal from "@/components/InesTotal";
import Setup from "@/components/Setup";
import Questions from "@/components/Questions";
import ParisRpRibbon from "@/components/ParisRpRibbon";
import LiveBanner from "@/components/LiveBanner";
import TwitchGoals from "@/components/TwitchGoals";
import TopClipsRail from "@/components/TopClipsRail";
import ScheduleList from "@/components/ScheduleList";
import StatsGrid from "@/components/StatsGrid";
import AboutTabs from "@/components/AboutTabs";
import MobileDonateBar from "@/components/MobileDonateBar";
import SectionHeader from "@/components/SectionHeader";
import { fetchLiveState } from "@/lib/twitch";

const TWITCH_LOGIN = "inespnj";

// Toujours rendre côté serveur à la demande (pas de cache d'app).
// Les helpers Twitch dans lib/twitch.ts utilisent leur propre cache via `next: { revalidate }`.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = createServerClient();
  const [{ data, error }, live] = await Promise.all([
    supabase
      .from("donation_goals")
      .select("*")
      .order("sort_order", { ascending: true }),
    fetchLiveState(TWITCH_LOGIN),
  ]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="neon-title text-5xl">InesPNJ</h1>
        <p className="mt-8 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-red-200">
          Impossible de charger les paliers: {error.message}
        </p>
      </main>
    );
  }

  const goals = data ?? [];

  return (
    <>
      <main
        className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:pb-16 sm:pt-10"
        style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
      >
        {/* 1. Paris RP ribbon — tout en haut */}
        <ParisRpRibbon />

        {/* 2. Identity strip + socials */}
        <header className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/inespnjv2.png"
              alt="Avatar d'InesPNJ"
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-white/10 sm:h-20 sm:w-20"
            />
            <div className="min-w-0 flex-1">
              <h1 className="neon-title text-3xl leading-none sm:text-4xl">
                InesPNJ
              </h1>
              <p className="mt-1 text-[12px] tracking-tight text-white/55">
                Streameuse Twitch · #freeines
              </p>
            </div>
            <div className="hidden sm:block">
              <TwitchPill
                initial={{ followers: live.followers, isLive: live.isLive }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="sm:hidden">
              <TwitchPill
                initial={{ followers: live.followers, isLive: live.isLive }}
              />
            </div>
            <Socials />
          </div>
        </header>

        {/* 3. Hero (compact) */}
        <section className="relative mt-8 overflow-hidden rounded-[28px] border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] px-6 py-6 text-center backdrop-blur-xl sm:mt-12 sm:px-12 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-aurora"
          />
          <div className="relative">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45 sm:text-xs">
              Il est temps de
            </p>
            <h2 className="neon-title hero-title mt-3">#freeines</h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-7 sm:flex-row">
              <a
                href="https://streamelements.com/inespnj/tip"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-neon-pink to-neon-yellow px-7 text-base font-bold uppercase tracking-wide text-white shadow-glow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_50px_-5px_rgba(255,58,166,0.7)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Faire un don
              </a>
              <a
                href="#about"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-7 text-base font-medium text-white/85 transition-colors hover:border-white/40 hover:bg-white/[0.05]"
              >
                Découvrir Inès
              </a>
            </div>
          </div>
        </section>

        {/* 4. Twitch Now card (live state ou dernier VOD) */}
        <LiveBanner login={TWITCH_LOGIN} />

        {/* 5. Twitch Goals card */}
        <TwitchGoals login={TWITCH_LOGIN} />

        {/* 6. Stats — section dédiée pour qu'elles soient visibles d'emblée */}
        <section className="mt-12">
          <SectionHeader
            eyebrow="Stats"
            title="La chaîne en chiffres"
            dotColor="bg-neon-yellow"
            className="mb-5"
          />
          <StatsGrid login={TWITCH_LOGIN} />
        </section>

        {/* 7. Top moments (clips rail) */}
        <TopClipsRail login={TWITCH_LOGIN} />

        {/* 8. Prochains lives */}
        <ScheduleList login={TWITCH_LOGIN} />

        {/* 9. À propos d'Inès — tabs Setup / Questions */}
        <section id="about" className="mt-12">
          <SectionHeader
            eyebrow="À propos"
            title="Tout savoir sur Inès"
            dotColor="bg-neon-blue"
            className="mb-5"
          />
          <AboutTabs setup={<Setup />} questions={<Questions />} />
        </section>

        {/* 10. Événements passés — Make a Wish archivé */}
        <section className="mt-16 border-t border-white/[0.06] pt-8">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white/65 transition-colors hover:text-white">
              <span className="flex items-center gap-2.5">
                <span aria-hidden="true">📦</span>
                <span>Événements passés</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 transition-transform group-open:rotate-180"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>

            <details className="group/maw mt-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium uppercase tracking-[0.2em] text-white/75 transition-colors hover:text-white sm:text-base">
                <span className="flex items-center gap-2.5">
                  <span aria-hidden="true">💖</span>
                  <span>Make a Wish · Avril 2026</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="flex items-baseline gap-1.5 normal-case tracking-normal">
                    <span className="text-base sm:text-lg">
                      <InesTotal variant="subtle" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/55 sm:text-xs">
                      récolté
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0 transition-transform group-open/maw:rotate-180"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>

              <div className="border-t border-white/[0.06] px-5 py-6 sm:px-7 sm:py-8">
                <div className="mb-8 rounded-2xl bg-white/[0.02] px-5 py-6 text-center sm:px-7 sm:py-8">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">
                    Total récolté
                  </p>
                  <p className="mt-3 text-4xl leading-none sm:text-5xl">
                    <InesTotal />
                  </p>
                  <div className="mt-4 flex justify-center">
                    <InesStats />
                  </div>
                  <p className="mt-5 text-xs text-white/55 sm:text-sm">
                    Shout-out à{" "}
                    <span className="font-semibold text-white/85">Jozy</span>{" "}
                    <span className="text-neon-pink">♥</span>
                    {" · "}
                    <a
                      href="https://www.twitch.tv/inespnj/videos?category=509663&filter=archives"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
                    >
                      rediffs sur Twitch
                    </a>
                  </p>
                </div>

                <GoalList initialGoals={goals} showCounter />
              </div>
            </details>
          </details>
        </section>

        {/* 11. Footer */}
        <footer className="mt-24 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 text-[12px] text-white/40 sm:flex-row">
          <Socials variant="footer" />
          <span>© InesPNJ {new Date().getFullYear()}</span>
        </footer>
      </main>

      {/* 12. Sticky mobile donate bar */}
      <MobileDonateBar />
    </>
  );
}
