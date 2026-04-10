import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Client Supabase côté serveur (utilise la clé secrète).
// À n'utiliser QUE dans des Route Handlers / Server Actions / Server Components.
export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_URL et SUPABASE_SECRET_KEY doivent être définis"
    );
  }

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
