import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseAnonKey } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Server Component ve route handler tarafı için Supabase istemcisi oluşturur.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components her zaman cookie yazamayabilir.
        }
      }
    }
  });
}
