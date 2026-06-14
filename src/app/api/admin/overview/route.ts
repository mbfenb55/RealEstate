import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { getAdminOverviewData } from "@/lib/admin-overview";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { syncAuthUser } from "@/lib/auth-user";
import { createClient } from "@/lib/supabase/server";

function resolvePrisma(): ReturnType<typeof getPrisma> | null {
  try {
    return getPrisma();
  } catch (error) {
    console.error("Admin overview Prisma client initialization failed:", error);
    return null;
  }
}

export async function GET() {
  if (!hasPublicSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase yapilandirmasi eksik." }, { status: 503 });
  }

  const prisma = resolvePrisma();

  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı başlatılamadı." }, { status: 503 });
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await syncAuthUser(user, prisma);

  if (!isAdmin(profile.email ?? user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const overview = await getAdminOverviewData(prisma);
  return NextResponse.json(overview);
}
