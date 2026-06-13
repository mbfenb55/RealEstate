import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasPublicSupabaseEnv } from "@/lib/env";
import { getSupabaseAnonKey } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Middleware katmanında session cookie’lerini yeniler ve kullanıcı varlığını header ile taşır.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  if (!hasPublicSupabaseEnv()) {
    response.headers.set("x-user-authenticated", "false");
    return response;
  }

  const supabase = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  response.headers.set("x-user-authenticated", user ? "true" : "false");
  return response;
}
