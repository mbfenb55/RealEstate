import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAnonKey } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Tarayıcı tarafı Supabase istemcisini oluşturur.
 */
export function createClient() {
  return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabaseAnonKey());
}
