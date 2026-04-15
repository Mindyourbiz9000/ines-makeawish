// FAQ déroulante — questions fréquentes d'Ines.
// Utilise <details>/<summary> natifs — aucun JS requis.

type QA = { question: string; answer: string };

const QUESTIONS: QA[] = [
  { question: "Quel est ton métier ?", answer: "Assistant de direction." },
  { question: "Ton signe astrologique ?", answer: "Scorpion." },
  {
    question: "Comment s'appelle ton chat ?",
    answer: "Pachi (c'est une femelle).",
  },
  {
    question: "C'est quoi ton aspirateur ?",
    answer: "Ce n'est PAS un Dyson.",
  },
];

export default function Questions() {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur open:border-neon-pink/40 open:shadow-glow-pink">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-white sm:text-base">
        <span className="flex items-center gap-2">
          <span aria-hidden="true">💬</span>
          <span>See my questions</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <ul className="divide-y divide-white/10 border-t border-white/10 px-5 py-3 text-sm">
        {QUESTIONS.map((qa) => (
          <li
            key={qa.question}
            className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:gap-3"
          >
            <span className="shrink-0 text-[11px] uppercase tracking-[0.25em] text-neon-pink/80 sm:w-56">
              {qa.question}
            </span>
            <span className="text-white/90">{qa.answer}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
