// FAQ d'Inès, une carte par question.

type QA = { question: string; answer: string; href?: string };

// (nbsp) avant le « ? » : convention typographique française.
const QUESTIONS: QA[] = [
  {
    question: "Quel est ton métier ?",
    answer: "Streameuse à plein temps. Elle Slayyy.",
  },
  { question: "Ton signe astrologique ?", answer: "Scorpion" },
  {
    question: "Comment s'appelle ton chat ?",
    answer: "Pachi (c'est une femelle)",
  },
  {
    question: "C'est quoi ton aspirateur ?",
    answer: "Ce n'est PAS un Dyson",
  },
  {
    question: "C'est quoi ta date de naissance ?",
    answer: "3 novembre 1997 (28 ans)",
  },
  {
    question: "Qui est ton meilleur ami connu ?",
    answer: "BigFlo",
    href: "https://www.instagram.com/bigflo/",
  },
  {
    question: "Est-ce que ce sont mes vrais yeux ?",
    answer: "Oui ma caille",
  },
];

export default function Questions() {
  return (
    <ul className="flex flex-col gap-2.5">
      {QUESTIONS.map((qa) => (
        <li
          key={qa.question}
          className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-5 py-4"
        >
          <p className="text-sm text-white/65">{qa.question}</p>
          <p className="mt-1.5 text-base font-medium text-white sm:text-[17px]">
            {qa.href ? (
              <a
                href={qa.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
              >
                {qa.answer}
              </a>
            ) : (
              qa.answer
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
