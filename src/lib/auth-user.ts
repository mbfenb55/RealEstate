import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { PrismaClient } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";

export async function syncAuthUser(authUser: SupabaseUser, prismaClient?: PrismaClient) {
  const prisma = prismaClient ?? getPrisma();
  const metadata = authUser.user_metadata ?? {};

  return prisma.user.upsert({
    where: {
      id: authUser.id
    },
    update: {
      email: authUser.email ?? "",
      fullName: metadata.full_name ?? metadata.fullName,
      companyName: metadata.company_name ?? metadata.companyName,
      phone: metadata.phone,
      logoUrl: metadata.logo_url ?? metadata.logoUrl,
      brandColor: metadata.brand_color ?? metadata.brandColor
    },
    create: {
      id: authUser.id,
      email: authUser.email ?? "",
      fullName: metadata.full_name ?? metadata.fullName,
      companyName: metadata.company_name ?? metadata.companyName,
      phone: metadata.phone,
      logoUrl: metadata.logo_url ?? metadata.logoUrl,
      brandColor: metadata.brand_color ?? metadata.brandColor
    }
  });
}
