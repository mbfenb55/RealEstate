import type { User as SupabaseUser } from "@supabase/supabase-js";

import { isAdmin } from "@/lib/admin";
import { syncAuthUser } from "@/lib/auth-user";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type PrismaClientInstance = ReturnType<typeof getPrisma>;

export function resolvePrisma(logLabel: string) {
  try {
    return getPrisma();
  } catch (error) {
    console.error(`${logLabel} Prisma client initialization failed:`, error);
    return null;
  }
}

export async function getAuthenticatedRequestContext(prisma: PrismaClientInstance) {
  if (!hasPublicSupabaseEnv()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await syncAuthUser(user, prisma);

  return {
    user,
    profile,
    adminUser: isAdmin(user.email ?? profile.email ?? "")
  };
}

export function buildScopedFilter(id: string, userId: string, adminUser: boolean) {
  return adminUser ? { id } : { id, userId };
}

export function canAccessOwnedResource(user: SupabaseUser, ownerUserId: string, adminUser: boolean) {
  return adminUser || user.id === ownerUserId;
}
