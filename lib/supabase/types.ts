// Types minimaux générés à la main pour la table donation_goals.
// Si tu ajoutes des colonnes, mets-les à jour ici.
export type Database = {
  public: {
    Tables: {
      donation_goals: {
        Row: {
          id: number;
          amount: number;
          label: string;
          completed: boolean;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          amount: number;
          label: string;
          completed?: boolean;
          sort_order: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          amount?: number;
          label?: string;
          completed?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
      };
    };
  };
};
