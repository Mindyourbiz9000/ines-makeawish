// FAQ d'Inès. Plus de <details> wrapper — intégrée dans <AboutTabs>.

type QA = { question: string; answer: string; href?: string };

// (nbsp) avant le « ? » : convention typographique française.
const QUESTIONS: QA[] = [
  {
    question: "Quel est ton métier ?",
    answer:
      "Assistante de direction (bientôt streameuse professionnelle dans le top 1 français)",
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
];

export default function Questions() {
  return (
    <ul className="space-y-5">
      {QUESTIONS.map((qa) => (
        <li key={qa.question} className="flex flex-col">
          <span className="text-[13px] text-white/60">{qa.question}</span>
          <span className="mt-0.5 text-[15px] text-white/95">
            {qa.href ? (
              <a
                href={qa.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                {qa.answer}
              </a>
            ) : (
              qa.answer
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
