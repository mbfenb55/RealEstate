import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";

import { syncAuthUser } from "@/lib/auth-user";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const registerSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  fullName: z.string().min(2).optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  logoUrl: z.string().url().optional(),
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/).optional()
});

type CurrentUserResult = {
  supabase: ReturnType<typeof createClient> | null;
  user: User | null;
};

async function getCurrentUser(): Promise<CurrentUserResult> {
  if (!hasPublicSupabaseEnv()) {
    return { supabase: null, user: null };
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function GET(request: Request, { params }: { params: { supabase: string[] } }) {
  const action = params.supabase?.[0];
  const requestUrl = new URL(request.url);
  const { supabase, user } = await getCurrentUser();

  if (action === "callback") {
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/dashboard";

    if (supabase && code) {
      await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  if (action === "signout") {
    if (supabase) {
      await supabase.auth.signOut();
    }

    return NextResponse.redirect(new URL("/giris", requestUrl.origin));
  }

  if (action === "profile") {
    if (!user) {
      return NextResponse.json({ profile: null }, { status: 401 });
    }

    const profile = await syncAuthUser(user);
    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        companyName: profile.companyName,
        phone: profile.phone,
        logoUrl: profile.logoUrl,
        brandColor: profile.brandColor,
        credits: profile.credits,
        createdAt: profile.createdAt.toISOString()
      }
    });
  }

  return NextResponse.json({ error: "Desteklenmeyen auth işlemi." }, { status: 404 });
}

export async function POST(request: Request, { params }: { params: { supabase: string[] } }) {
  const action = params.supabase?.[0];

  if (!hasPublicSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase yapılandırması eksik." }, { status: 503 });
  }

  if (action === "delete-account") {
    const { user } = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 401 });
    }

    await prisma.user.deleteMany({
      where: { id: user.id }
    });

    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  }

  if (action !== "register") {
    return NextResponse.json({ error: "Desteklenmeyen auth işlemi." }, { status: 404 });
  }

  const payload = registerSchema.parse(await request.json());
  const { user } = await getCurrentUser();

  let authUser = user;

  if (!authUser && payload.userId) {
    const admin = createAdminClient();
    const {
      data: { user: verifiedUser }
    } = await admin.auth.admin.getUserById(payload.userId);
    authUser = verifiedUser ?? null;
  }

  if (!authUser) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 401 });
  }

  if (payload.email && authUser.email !== payload.email) {
    return NextResponse.json({ error: "Kullanıcı doğrulanamadı." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: authUser.id }
  });

  const profile = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {
      email: authUser.email ?? payload.email ?? "",
      fullName: payload.fullName ?? authUser.user_metadata?.full_name ?? authUser.user_metadata?.fullName ?? null,
      companyName:
        payload.companyName ?? authUser.user_metadata?.company_name ?? authUser.user_metadata?.companyName ?? null,
      phone: payload.phone ?? authUser.user_metadata?.phone ?? null,
      logoUrl: payload.logoUrl ?? authUser.user_metadata?.logo_url ?? authUser.user_metadata?.logoUrl ?? null,
      brandColor:
        payload.brandColor ?? authUser.user_metadata?.brand_color ?? authUser.user_metadata?.brandColor ?? null
    },
    create: {
      id: authUser.id,
      email: authUser.email ?? payload.email ?? "",
      fullName: payload.fullName ?? authUser.user_metadata?.full_name ?? authUser.user_metadata?.fullName ?? null,
      companyName:
        payload.companyName ?? authUser.user_metadata?.company_name ?? authUser.user_metadata?.companyName ?? null,
      phone: payload.phone ?? authUser.user_metadata?.phone ?? null,
      logoUrl: payload.logoUrl ?? authUser.user_metadata?.logo_url ?? authUser.user_metadata?.logoUrl ?? null,
      brandColor:
        payload.brandColor ?? authUser.user_metadata?.brand_color ?? authUser.user_metadata?.brandColor ?? "#1E3A8A",
      credits: 1
    }
  });

  if (!existingUser && profile.credits <= 1) {
    await sendWelcomeEmail(profile.email, {
      fullName: profile.fullName,
      credits: profile.credits
    });
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      companyName: profile.companyName,
      phone: profile.phone,
      logoUrl: profile.logoUrl,
      brandColor: profile.brandColor,
      credits: profile.credits,
      createdAt: profile.createdAt.toISOString()
    }
  });
}
