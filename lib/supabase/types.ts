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
      cached_data: {
        Row: {
          key: string;
          payload: unknown;
          fetched_at: string;
        };
        Insert: {
          key: string;
          payload: unknown;
          fetched_at?: string;
        };
        Update: {
          key?: string;
          payload?: unknown;
          fetched_at?: string;
        };
        Relationships: [];
      };
      shop_products: {
        Row: {
          id: number;
          slug: string;
          code: string;
          name: string;
          description: string | null;
          image_src: string | null;
          price_cents: number;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          code: string;
          name: string;
          description?: string | null;
          image_src?: string | null;
          price_cents: number;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          code?: string;
          name?: string;
          description?: string | null;
          image_src?: string | null;
          price_cents?: number;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shop_product_variants: {
        Row: {
          id: number;
          product_id: number;
          size: string;
          stock: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          product_id: number;
          size: string;
          stock?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          product_id?: number;
          size?: string;
          stock?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shop_orders: {
        Row: {
          id: number;
          ref: string;
          status:
            | "pending"
            | "paid"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          customer_email: string | null;
          customer_name: string | null;
          shipping: unknown | null;
          subtotal_cents: number;
          total_cents: number;
          currency: string;
          mock: boolean;
          view_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          ref: string;
          status?:
            | "pending"
            | "paid"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          customer_email?: string | null;
          customer_name?: string | null;
          shipping?: unknown | null;
          subtotal_cents: number;
          total_cents: number;
          currency?: string;
          mock?: boolean;
          view_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          ref?: string;
          status?:
            | "pending"
            | "paid"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          customer_email?: string | null;
          customer_name?: string | null;
          shipping?: unknown | null;
          subtotal_cents?: number;
          total_cents?: number;
          currency?: string;
          mock?: boolean;
          view_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shop_order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number | null;
          variant_id: number | null;
          code: string;
          name: string;
          size: string;
          quantity: number;
          unit_price_cents: number;
        };
        Insert: {
          id?: number;
          order_id: number;
          product_id?: number | null;
          variant_id?: number | null;
          code: string;
          name: string;
          size: string;
          quantity: number;
          unit_price_cents: number;
        };
        Update: {
          id?: number;
          order_id?: number;
          product_id?: number | null;
          variant_id?: number | null;
          code?: string;
          name?: string;
          size?: string;
          quantity?: number;
          unit_price_cents?: number;
        };
        Relationships: [];
      };
      shop_settings: {
        Row: {
          key: string;
          value: unknown;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: unknown;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: unknown;
          updated_at?: string;
        };
        Relationships: [];
      };
      shop_deliveries: {
        Row: {
          id: number;
          order_id: number;
          carrier: string | null;
          tracking_number: string | null;
          status:
            | "preparing"
            | "shipped"
            | "in_transit"
            | "delivered"
            | "exception";
          shipped_at: string | null;
          delivered_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          order_id: number;
          carrier?: string | null;
          tracking_number?: string | null;
          status?:
            | "preparing"
            | "shipped"
            | "in_transit"
            | "delivered"
            | "exception";
          shipped_at?: string | null;
          delivered_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          order_id?: number;
          carrier?: string | null;
          tracking_number?: string | null;
          status?:
            | "preparing"
            | "shipped"
            | "in_transit"
            | "delivered"
            | "exception";
          shipped_at?: string | null;
          delivered_at?: string | null;
          notes?: string | null;
          created_at?: string;
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
