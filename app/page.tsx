import Socials from "@/components/Socials";
import Setup from "@/components/Setup";
import Questions from "@/components/Questions";
import AboutTabs from "@/components/AboutTabs";
import ChannelSection from "@/components/ChannelSection";
import MobileDonateBar from "@/components/MobileDonateBar";
import { fetchLiveState } from "@/lib/twitch";

const TWITCH_LOGIN = "inespnj";
const DONATE_URL = "https://streamelements.com/inespnj/tip";

// Toujours rendre côté serveur à la demande (pas de cache d'app).
// Les helpers Twitch dans lib/twitch.ts utilisent leur propre cache via `next: { revalidate }`.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatStatus(roles: { isPartner: boolean; isAffiliate: boolean }) {
  if (roles.isPartner) return "Partenaire Twitch";
  if (roles.isAffiliate) return "Affiliée Twitch";
  return null;
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function ArrowIcon({ className, diagonal = false }: { className?: string; diagonal?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {diagonal ? <path d="M7 17L17 7M8 7h9v9" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  );
}

export default async function HomePage() {
  const live = await fetchLiveState(TWITCH_LOGIN);
  const status = formatStatus(live.roles);

  return (
    <>
      <div className="relative overflow-x-clip">
        {/* Navigation */}
        <header
          className="sticky top-0 z-30 mx-auto max-w-[1200px] px-4 pt-4 sm:px-6 sm:pt-6"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <nav
            aria-label="Navigation principale"
            className="flex items-center justify-between gap-4 rounded-full border border-white/[0.08] bg-night-800/60 py-2 pl-5 pr-2 backdrop-blur-xl sm:pl-6"
          >
            <a href="#top" className="neon-title-sm text-2xl sm:text-[26px]">
              InesPNJ
            </a>
            <div className="hidden items-center gap-1 text-sm font-medium md:flex">
              {[
                { href: "#live", label: "Live" },
                { href: "#stats", label: "Stats" },
                { href: "#about", label: "Setup" },
                { href: "#about", label: "FAQ" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="rounded-full px-4 py-3 text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.twitch.tv/inespnj"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-xs font-semibold uppercase tracking-[0.04em] sm:text-[13px] ${
                  live.isLive ? "bg-neon-pink/15 text-[#ff9ed1]" : "bg-white/[0.05] text-white/70"
                }`}
              >
                {live.isLive ? (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-pink opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-pink shadow-[0_0_10px_#ff3aa6]" />
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white/40" />
                )}
                {live.isLive ? "En live" : "Hors ligne"}
              </a>
              <a
                href={DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-11 items-center rounded-full bg-gradient-to-r from-neon-pink to-neon-yellow px-5 text-sm font-semibold text-night-900 sm:inline-flex"
              >
                Faire un don
              </a>
            </div>
          </nav>
        </header>

        <main id="top" className="mx-auto max-w-[1200px] px-4 pb-28 sm:px-6 sm:pb-0">
          {/* Hero */}
          <section className="flex flex-col items-center gap-10 pb-10 pt-10 text-center sm:pb-[72px] sm:pt-24 lg:flex-row lg:items-center lg:gap-12 lg:text-left">
            <div className="order-2 min-w-0 flex-1 lg:order-1">
              <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.22em] text-neon-blue sm:text-[13px]">
                <span className="hidden h-px w-7 bg-neon-blue lg:inline-block" />
                Streameuse Twitch
              </p>
              <h1 className="mt-3 font-heading text-[40px] font-extrabold leading-[0.95] tracking-[-0.03em] sm:mt-5 sm:text-[clamp(48px,7vw,96px)]">
                Il est temps de
              </h1>
              <p className="neon-title mt-1 text-[68px] leading-[1.15] sm:text-[clamp(64px,10vw,140px)] sm:leading-[1.1]">
                #freeines
              </p>
              <p className="mx-auto mt-3 max-w-[460px] text-base leading-relaxed text-white/70 sm:mt-6 sm:text-lg lg:mx-0">
                Fini le bureau : Inès Slayyy à plein temps sur Twitch.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href={DONATE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden h-14 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-neon-pink to-neon-yellow px-7 text-base font-semibold text-night-900 shadow-[0_10px_40px_-8px_rgba(255,58,166,0.8)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
                >
                  <HeartIcon className="h-[18px] w-[18px]" />
                  Faire un don
                </a>
                <a
                  href="https://www.twitch.tv/inespnj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full border border-white/[0.18] px-7 text-base font-medium text-white transition-colors hover:border-white/40 hover:bg-white/[0.04] sm:h-14"
                >
                  Regarder sur Twitch
                  <ArrowIcon diagonal className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="relative order-1 aspect-square w-[200px] shrink-0 sm:w-[320px] lg:order-2 lg:w-[400px]">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,#ff3aa6,#4ad6ff,#ffd84a,#ff3aa6)] opacity-90 blur-[14px] lg:blur-[18px]"
              />
              <div aria-hidden="true" className="absolute inset-1 rounded-full bg-night-800 lg:inset-1.5" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/inespnjv2.png"
                alt="Avatar d'InesPNJ"
                className="absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)] rounded-full object-cover lg:inset-[18px] lg:h-[calc(100%-36px)] lg:w-[calc(100%-36px)]"
              />
              {live.followers > 0 ? (
                <div className="absolute -left-6 bottom-14 hidden items-center gap-2.5 rounded-[18px] border border-neon-blue/30 bg-night-800/85 px-4 py-3 text-left backdrop-blur-md lg:flex">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4ad6ff"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
                  </svg>
                  <div>
                    <div className="font-heading text-xl font-extrabold leading-none tabular-nums">
                      {live.followers.toLocaleString("fr-FR")}
                    </div>
                    <div className="mt-1 text-xs text-white/65">followers Twitch</div>
                  </div>
                </div>
              ) : null}
              {status ? (
                <div className="absolute -right-3 top-12 hidden rotate-[4deg] rounded-[14px] bg-neon-yellow px-3.5 py-2.5 text-[13px] font-semibold text-night-900 lg:block">
                  {status}
                </div>
              ) : null}
            </div>
          </section>

          {/* Réseaux */}
          <div className="pb-12 sm:pb-24">
            <Socials />
          </div>

          {/* Live + stats */}
          <ChannelSection live={live} />

          {/* À propos */}
          <section id="about" className="scroll-mt-28 pb-12 sm:pb-28">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neon-blue sm:text-[13px]">
              À propos
            </p>
            <h2 className="mb-5 mt-2 font-heading text-[32px] font-extrabold leading-none tracking-[-0.02em] sm:mb-7 sm:mt-2.5 sm:text-5xl">
              Tout savoir sur Inès
            </h2>
            <AboutTabs setup={<Setup />} questions={<Questions />} />
          </section>

          {/* Bandeau don (desktop) */}
          <section className="mb-16 hidden flex-wrap items-center justify-between gap-6 rounded-[36px] bg-[linear-gradient(110deg,#ff3aa6_0%,#ff7a8a_45%,#ffd84a_100%)] px-12 py-16 text-night-900 sm:flex">
            <div>
              <p className="font-display text-[56px] leading-[1.2]">#freeines</p>
              <p className="mt-2 text-lg font-medium">Soutiens Inès via StreamElements.</p>
            </div>
            <a
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[60px] items-center gap-2.5 rounded-full bg-night-900 px-8 text-[17px] font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Faire un don
              <ArrowIcon className="h-[18px] w-[18px]" />
            </a>
          </section>
        </main>

        <footer className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 border-t border-white/[0.08] px-4 pb-32 pt-6 text-[13px] text-white/60 sm:flex-row sm:px-6 sm:pb-12 sm:pt-8 sm:text-sm">
          <span className="neon-title-sm hidden text-[22px] sm:inline">InesPNJ</span>
          <span>
            © InesPNJ {new Date().getFullYear()} · par LeBarv__
          </span>
        </footer>
      </div>

      <MobileDonateBar />
    </>
  );
}
