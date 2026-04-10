// Types minimaux écrits à la main pour la table donation_goals.
// Même structure que celle produite par `supabase gen types typescript`,
// pour que @supabase/supabase-js infère correctement les paramètres
// de .update() / .insert() / .select().
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
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
