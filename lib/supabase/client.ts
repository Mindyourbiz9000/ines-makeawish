import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Client Supabase côté navigateur (lecture seule via anon key + RLS).
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définis"
    );
  }

  return createClient<Database>(url, anonKey, {
    realtime: { params: { eventsPerSecond: 5 } },
  });
}
