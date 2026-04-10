// Liste des donation goals (source de vérité pour le seed de la DB).
// Si tu veux ajouter / modifier un palier, édite ici puis relance le seed.
export type Goal = {
  amount: number;
  label: string;
};

export const GOALS: Goal[] = [
  { amount: 1, label: "J'allume le micro" },
  { amount: 50, label: "Red Bull cul sec + concours de rot" },
  { amount: 200, label: "J'appelle ma maman et je lui gratte un don" },
  { amount: 500, label: "Face reveal de Blasheer aka GP2" },
  { amount: 800, label: "1v1 Just Dance avec Blasheer" },
  { amount: 1200, label: "Premier tribunal des bannis de la chaîne" },
  { amount: 1500, label: "J'apprends la choré de Jennie à Broocoline" },
  { amount: 1800, label: "Interview fin de carrière avec Broocoline" },
  { amount: 2000, label: "Cosplay Jenna & Clara avec Broocoline" },
  { amount: 2500, label: "J'appelle la personne la plus connue de mon téléphone" },
  { amount: 3000, label: "J'invite Booba (via un réel) pour une interview sur le milieu du stream" },
];
