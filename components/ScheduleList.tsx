// Server component : liste compacte des prochains lives Twitch programmés.
// Cachée si aucun stream prévu.

import { fetchSchedule } from "@/lib/twitch";
import SectionHeader from "./SectionHeader";

const WEEKDAY_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function parseSegment(iso: string): {
  weekday: string;
  day: string;
  time: string;
} | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  return {
    weekday: WEEKDAY_FR[d.getDay()] ?? "",
    day: d.getDate().toString(),
    time: `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`,
  };
}

export default async function ScheduleList({ login }: { login: string }) {
  const segments = await fetchSchedule(login, 3);
  if (segments.length === 0) return null;
  return (
    <section className="mt-12">
      <SectionHeader
        eyebrow="Prochains lives"
        title="Au programme"
        dotColor="bg-[#9146FF]"
        className="mb-5"
      />
      <ul className="overflow-hidden rounded-2xl bg-white/[0.02] ring-1 ring-white/10 divide-y divide-white/[0.05]">
        {segments.map((s, i) => {
          const parsed = parseSegment(s.startAt);
          return (
            <li
              key={i}
              className="flex min-h-[64px] items-center gap-4 p-4"
            >
              <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-white/[0.04] py-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                  {parsed?.weekday ?? "—"}
                </span>
                <span className="text-lg font-semibold leading-none text-white tabular-nums">
                  {parsed?.day ?? "—"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white/90">
                  {s.title}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-white/50">
                  {parsed?.time ?? ""}
                  {parsed?.time && s.category ? " · " : ""}
                  {s.category ?? ""}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
