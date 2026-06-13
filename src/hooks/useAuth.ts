"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { hasPublicSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import type { AuthProfile } from "@/types";

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  companyName?: string;
  phone?: string;
};

type SyncProfilePayload = {
  fullName?: string;
  companyName?: string;
  phone?: string;
  logoUrl?: string;
  brandColor?: string;
};

function createMissingConfigError() {
  return {
    error: new Error("Supabase environment variables are missing.")
  } as const;
}

export function useAuth() {
  const supabase = useMemo(() => (hasPublicSupabaseEnv() ? createClient() : null), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!supabase) {
      setProfile(null);
      return null;
    }

    const response = await fetch("/api/auth/profile", {
      cache: "no-store"
    });

    if (!response.ok) {
      setProfile(null);
      return null;
    }

    const payload = (await response.json()) as { profile: AuthProfile | null };
    setProfile(payload.profile);
    return payload.profile;
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const getSession = async () => {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await fetchProfile();
      }
      setLoading(false);
    };

    void getSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, supabase]);

  return {
    session,
    user,
    profile,
    loading,
    refreshProfile: fetchProfile,
    signIn: (email: string, password: string) =>
      supabase ? supabase.auth.signInWithPassword({ email, password }) : Promise.resolve(createMissingConfigError()),
    signInWithGoogle: (next = "/dashboard") =>
      supabase
        ? supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/api/auth/callback?${new URLSearchParams({
                next
              }).toString()}`
            }
          })
        : Promise.resolve(createMissingConfigError()),
    register: async (payload: RegisterPayload) => {
      if (!supabase) {
        return createMissingConfigError();
      }

      const signUpResult = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.fullName,
            company_name: payload.companyName,
            phone: payload.phone
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
        }
      });

      if (signUpResult.error || !signUpResult.data.user) {
        return signUpResult;
      }

      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: signUpResult.data.user.id,
          email: payload.email,
          fullName: payload.fullName,
          companyName: payload.companyName,
          phone: payload.phone
        })
      });

      if (!registerResponse.ok) {
        const registerPayload = (await registerResponse.json().catch(() => null)) as { error?: string } | null;

        return {
          data: signUpResult.data,
          error: new Error(registerPayload?.error ?? "Kullanıcı profili oluşturulamadı.")
        };
      }

      if (!signUpResult.data.session) {
        return await supabase.auth.signInWithPassword({
          email: payload.email,
          password: payload.password
        });
      }

      await fetchProfile();
      return signUpResult;
    },
    syncProfile: async (payload: SyncProfilePayload) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return null;
      }

      return fetchProfile();
    },
    resetPassword: (email: string) =>
      supabase
        ? supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/giris`
          })
        : Promise.resolve(createMissingConfigError()),
    deleteAccount: async () => {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        return {
          error: new Error(payload?.error ?? "Hesap silinemedi.")
        };
      }

      return { error: null };
    },
    signOut: async () => {
      if (!supabase) {
        return createMissingConfigError();
      }

      setProfile(null);
      return supabase.auth.signOut();
    }
  };
}
