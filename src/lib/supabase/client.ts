import { createBrowserClient as createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session, User } from "@supabase/supabase-js";

import { ADMIN_EMAIL, isAdmin } from "@/lib/admin";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { getSupabaseAnonKey } from "@/lib/env";
import type { Database } from "@/types/database";

type BrowserClient = ReturnType<typeof createClientComponentClient<Database>>;
type AuthChangeCallback = Parameters<BrowserClient["auth"]["onAuthStateChange"]>[0];

function buildMockAdminUser(): User {
  const now = new Date().toISOString();

  return {
    id: "mock-admin-user",
    aud: "authenticated",
    role: "authenticated",
    email: ADMIN_EMAIL,
    phone: null,
    created_at: now,
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: {
      provider: "email",
      providers: ["email"]
    },
    user_metadata: {
      full_name: "Admin Kullanıcı",
      fullName: "Admin Kullanıcı",
      company_name: "Parselim",
      companyName: "Parselim",
      phone: null,
      logo_url: null,
      logoUrl: null,
      brand_color: "#1E3A8A",
      brandColor: "#1E3A8A"
    },
    identities: [],
    factors: [],
    is_anonymous: false
  } as unknown as User;
}

function buildMockAdminSession(): Session {
  const now = new Date();

  return {
    access_token: "mock-admin-access-token",
    refresh_token: "mock-admin-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(now.getTime() / 1000) + 3600,
    token_type: "bearer",
    user: buildMockAdminUser()
  };
}

function createMockSupabaseClient(): BrowserClient {
  let currentSession: Session | null = isAdmin(ADMIN_EMAIL) ? buildMockAdminSession() : null;
  const listeners = new Set<AuthChangeCallback>();

  const emitAuthStateChange = (event: "INITIAL_SESSION" | "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED") => {
    for (const callback of listeners) {
      callback(event, currentSession);
    }
  };

  const failureResponse = <T>(message: string) => ({
    data: null as T | null,
    error: new Error(message)
  });

  const auth = {
    async getSession() {
      return {
        data: { session: currentSession },
        error: null
      };
    },
    async getUser() {
      return {
        data: { user: currentSession?.user ?? null },
        error: null
      };
    },
    onAuthStateChange(callback: AuthChangeCallback) {
      listeners.add(callback);

      const timeoutId = window.setTimeout(() => {
        callback("INITIAL_SESSION", currentSession);
      }, 0);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              window.clearTimeout(timeoutId);
              listeners.delete(callback);
            }
          }
        }
      };
    },
    async signInWithPassword() {
      if (!isAdmin(ADMIN_EMAIL)) {
        return failureResponse("Supabase yapılandırması eksik.");
      }

      currentSession = buildMockAdminSession();
      emitAuthStateChange("SIGNED_IN");

      return {
        data: {
          user: currentSession.user,
          session: currentSession
        },
        error: null
      };
    },
    async signInWithOAuth() {
      return failureResponse("Supabase yapılandırması eksik.");
    },
    async signUp() {
      if (!isAdmin(ADMIN_EMAIL)) {
        return failureResponse("Supabase yapılandırması eksik.");
      }

      currentSession = buildMockAdminSession();
      emitAuthStateChange("SIGNED_IN");

      return {
        data: {
          user: currentSession.user,
          session: currentSession
        },
        error: null
      };
    },
    async resetPasswordForEmail() {
      return failureResponse("Supabase yapılandırması eksik.");
    },
    async signOut() {
      currentSession = null;
      emitAuthStateChange("SIGNED_OUT");

      return {
        error: null
      };
    },
    async updateUser(options?: { data?: Record<string, unknown>; email?: string }) {
      if (!currentSession) {
        return failureResponse("Aktif oturum bulunamadı.");
      }

      const metadata = { ...(currentSession.user.user_metadata as Record<string, unknown> | undefined) };

      if (options?.email) {
        currentSession = {
          ...currentSession,
          user: {
            ...currentSession.user,
            email: options.email
          }
        };
      }

      if (options?.data) {
        for (const [key, value] of Object.entries(options.data)) {
          metadata[key] = value;
        }

        currentSession = {
          ...currentSession,
          user: {
            ...currentSession.user,
            user_metadata: metadata
          }
        };
      }

      emitAuthStateChange("USER_UPDATED");

      return {
        data: { user: currentSession.user },
        error: null
      };
    },
    async refreshSession() {
      return {
        data: { session: currentSession },
        error: null
      };
    }
  };

  const storage = {
    from() {
      return {
        async upload() {
          return failureResponse("Supabase Storage yapılandırması eksik.");
        },
        getPublicUrl() {
          return {
            data: {
              publicUrl: ""
            }
          };
        },
        async remove() {
          return failureResponse("Supabase Storage yapılandırması eksik.");
        },
        async list() {
          return failureResponse("Supabase Storage yapılandırması eksik.");
        }
      };
    }
  };

  return {
    auth,
    storage
  } as unknown as BrowserClient;
}

/**
 * Tarayıcı tarafı Supabase istemcisini oluşturur.
 * Ortam değişkenleri eksikse admin test akışı için mock client döner.
 */
export function createClient() {
  if (!hasPublicSupabaseEnv()) {
    return createMockSupabaseClient();
  }

  return createClientComponentClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabaseAnonKey());
}
