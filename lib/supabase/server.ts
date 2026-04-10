import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Client Supabase côté serveur (utilise la clé secrète — contourne RLS).
// À n'utiliser QUE dans des Route Handlers / Server Actions.
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY doivent être définis"
    );
  }

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
