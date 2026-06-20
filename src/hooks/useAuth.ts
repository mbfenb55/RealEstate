"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import { ADMIN_EMAIL, isAdmin } from "@/lib/admin";
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

function buildLocalProfile(user: User): AuthProfile {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const fullName = typeof metadata?.full_name === "string" ? metadata.full_name : typeof metadata?.fullName === "string" ? metadata.fullName : null;
  const companyName =
    typeof metadata?.company_name === "string"
      ? metadata.company_name
      : typeof metadata?.companyName === "string"
        ? metadata.companyName
        : null;
  const phone = typeof metadata?.phone === "string" ? metadata.phone : null;
  const logoUrl =
    typeof metadata?.logo_url === "string"
      ? metadata.logo_url
      : typeof metadata?.logoUrl === "string"
        ? metadata.logoUrl
        : null;
  const brandColor =
    typeof metadata?.brand_color === "string"
      ? metadata.brand_color
      : typeof metadata?.brandColor === "string"
        ? metadata.brandColor
        : "#1E3A8A";

  return {
    id: user.id,
    email: user.email ?? ADMIN_EMAIL,
    fullName,
    companyName,
    phone,
    logoUrl,
    brandColor,
    credits: isAdmin(user.email ?? "") ? 999 : 1,
    createdAt: user.created_at ?? new Date().toISOString()
  };
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useAuth() {
  const configured = useMemo(() => hasPublicSupabaseEnv(), []);
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (currentUser?: User | null) => {
      const targetUser = currentUser ?? user ?? session?.user ?? null;

      if (!configured) {
        if (!targetUser) {
          setProfile(null);
          return null;
        }

        const localProfile = buildLocalProfile(targetUser);
        setProfile(localProfile);
        return localProfile;
      }

      if (!targetUser) {
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
    },
    [configured, session?.user, user]
  );

  const getSessionWithRetry = useCallback(async () => {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const {
          data: { session: currentSession }
        } = await supabase.auth.getSession();

        if (currentSession) {
          return currentSession;
        }
      } catch (error) {
        if (attempt >= maxAttempts) {
          return null;
        }

        console.warn("Supabase session fetch failed, retrying:", error);
      }

      if (attempt < maxAttempts) {
        await sleep(1000);
      }
    }

    return null;
  }, [supabase]);

  useEffect(() => {
    let active = true;
    let initialSessionLoaded = false;

    const initialize = async () => {
      const currentSession = await getSessionWithRetry();

      if (!active) {
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user);
      } else {
        setProfile(null);
      }

      initialSessionLoaded = true;
      setLoading(false);
    };

    void initialize();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, nextSession: Session | null) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await fetchProfile(nextSession.user);
      } else {
        setProfile(null);
      }

      if (nextSession || initialSessionLoaded) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, getSessionWithRetry, supabase]);

  return {
    session,
    user,
    profile,
    loading,
    refreshProfile: fetchProfile,
    signIn: (email: string, password: string) =>
      configured ? supabase.auth.signInWithPassword({ email, password }) : Promise.resolve(createMissingConfigError()),
    signInWithGoogle: (next = "/dashboard") =>
      configured
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
      if (!configured) {
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

      await fetchProfile(signUpResult.data.user);
      return signUpResult;
    },
    syncProfile: async (payload: SyncProfilePayload) => {
      if (!configured) {
        const currentUser = user ?? session?.user ?? null;

        if (!currentUser) {
          return null;
        }

        const mergedProfile: AuthProfile = {
          ...buildLocalProfile(currentUser),
          fullName: payload.fullName ?? buildLocalProfile(currentUser).fullName,
          companyName: payload.companyName ?? buildLocalProfile(currentUser).companyName,
          phone: payload.phone ?? buildLocalProfile(currentUser).phone,
          logoUrl: payload.logoUrl ?? buildLocalProfile(currentUser).logoUrl,
          brandColor: payload.brandColor ?? buildLocalProfile(currentUser).brandColor
        };

        setProfile(mergedProfile);
        return mergedProfile;
      }

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
      configured
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
      setProfile(null);
      return supabase.auth.signOut();
    }
  };
}
