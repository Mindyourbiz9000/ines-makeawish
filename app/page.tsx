import Socials from "@/components/Socials";
import TwitchPill from "@/components/TwitchPill";
import Setup from "@/components/Setup";
import Questions from "@/components/Questions";
import LiveBanner from "@/components/LiveBanner";
import StatsGrid from "@/components/StatsGrid";
import SullyGnomeStats from "@/components/SullyGnomeStats";
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
  const live = await fetchLiveState(TWITCH_LOGIN);

  return (
    <>
      <main
        className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:pb-16 sm:pt-10"
        style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
      >
        {/* 1. Identity strip + socials */}
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
          <div className="sm:hidden">
            <TwitchPill
              initial={{ followers: live.followers, isLive: live.isLive }}
            />
          </div>
          <Socials />
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

        {/* 4. Twitch Now card (live state ou dernier replay) */}
        <LiveBanner live={live} />

        {/* 5. Stats — alimentées par IVR.fi, se cache toute seule si pas de données */}
        <StatsGrid live={live} />

        {/* 6. Stats 7 jours — scrapées depuis sullygnome.com, se cache si scraping rate */}
        <SullyGnomeStats login={TWITCH_LOGIN} period={7} />

        {/* 7. À propos d'Inès — tabs Setup / Questions */}
        <section id="about" className="mt-12">
          <SectionHeader
            eyebrow="À propos"
            title="Tout savoir sur Inès"
            dotColor="bg-neon-blue"
            className="mb-5"
          />
          <AboutTabs setup={<Setup />} questions={<Questions />} />
        </section>

        {/* 11. Footer */}
        <footer className="mt-24 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 text-[12px] text-white/40 sm:flex-row">
          <Socials variant="footer" />
          <span>
            © InesPNJ {new Date().getFullYear()}
            <span className="text-white/30"> · par LeBarv__</span>
          </span>
        </footer>
      </main>

      {/* 12. Sticky mobile donate bar */}
      <MobileDonateBar />
    </>
  );
}
