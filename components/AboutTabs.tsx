"use client";

// À propos : sur mobile, onglets Questions / Setup ; sur desktop, les deux
// côte à côte (FAQ à gauche, setup à droite).

import { useState, type ReactNode } from "react";

type Tab = "questions" | "setup";

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

  return (
    <div>
      <div
        role="tablist"
        aria-label="À propos"
        className="mb-3.5 grid grid-cols-2 gap-1 rounded-full border border-white/[0.08] bg-white/[0.05] p-1 lg:hidden"
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`pane-${tab.id}`}
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={`min-h-[44px] rounded-full text-[15px] font-semibold transition-colors ${
                isActive ? "bg-white text-night-900" : "text-white/75 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div
          id="pane-questions"
          role="tabpanel"
          aria-labelledby="tab-questions"
          className={`${active === "questions" ? "block" : "hidden"} lg:col-span-5 lg:block`}
        >
          {questions}
        </div>
        <div
          id="pane-setup"
          role="tabpanel"
          aria-labelledby="tab-setup"
          className={`${active === "setup" ? "block" : "hidden"} lg:col-span-7 lg:block`}
        >
          {setup}
        </div>
      </div>
    </div>
  );
}
