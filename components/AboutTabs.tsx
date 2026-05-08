"use client";

import { useState, type ReactNode } from "react";

type Tab = "setup" | "questions";

const TABS: { id: Tab; label: string }[] = [
  { id: "questions", label: "Questions" },
  { id: "setup", label: "Setup" },
];

type Props = {
  setup: ReactNode;
  questions: ReactNode;
};

export default function AboutTabs({ setup, questions }: Props) {
  const [active, setActive] = useState<Tab>("questions");
  const panes: Record<Tab, ReactNode> = { setup, questions };
  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-2">
      <div role="tablist" className="flex gap-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={`flex-1 min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/[0.06] text-white ring-1 ring-white/10 shadow-inner"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="px-4 sm:px-5 py-5">
        {panes[active]}
      </div>
    </div>
  );
}
