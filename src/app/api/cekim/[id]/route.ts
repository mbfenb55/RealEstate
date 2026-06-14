import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdmin } from "@/lib/admin";
import { syncAuthUser } from "@/lib/auth-user";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { mapShootToRecord } from "@/lib/shoots";
import { createClient } from "@/lib/supabase/server";

const updateShootSchema = z.object({
  status: z.enum(["PROCESSING", "READY", "FAILED"]).optional(),
  type: z.enum(["DRONE", "TOUR_3D", "COMBO"]).optional(),
  voiceoverText: z.string().optional(),
  audioUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  logoUrl: z.string().optional(),
  phoneNumber: z.string().optional(),
  brandColor: z.string().optional(),
  nearbyLabels: z.any().optional(),
  landAnalysis: z.any().optional(),
  completedAt: z.string().datetime().optional()
});

type PrismaClientInstance = ReturnType<typeof getPrisma>;

function resolvePrisma(): PrismaClientInstance | null {
  try {
    return getPrisma();
  } catch (error) {
    console.error("Çekim detay Prisma client initialization failed:", error);
    return null;
  }
}

async function getAuthenticatedUser(prisma: PrismaClientInstance) {
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

  await syncAuthUser(user, prisma);
  return user;
}

function getAccessFilter(shootId: string, userId: string, canAccessAll: boolean) {
  return canAccessAll ? { id: shootId } : { id: shootId, userId };
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const prisma = resolvePrisma();

  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı başlatılamadı." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(prisma);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = isAdmin(user.email ?? "");
  const shoot = await prisma.shoot.findFirst({
    where: getAccessFilter(params.id, user.id, adminUser)
  });

  if (!shoot) {
    return NextResponse.json({ error: "Çekim bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ item: mapShootToRecord(shoot) });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const prisma = resolvePrisma();

  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı başlatılamadı." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(prisma);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = isAdmin(user.email ?? "");
  const payload = updateShootSchema.parse(await request.json());
  const result = await prisma.shoot.updateMany({
    where: getAccessFilter(params.id, user.id, adminUser),
    data: {
      status: payload.status,
      type: payload.type,
      voiceoverText: payload.voiceoverText,
      audioUrl: payload.audioUrl,
      videoUrl: payload.videoUrl,
      logoUrl: payload.logoUrl,
      phoneNumber: payload.phoneNumber,
      brandColor: payload.brandColor,
      nearbyLabels: payload.nearbyLabels,
      landAnalysis: payload.landAnalysis,
      completedAt: payload.completedAt ? new Date(payload.completedAt) : undefined
    }
  });

  if (!result.count) {
    return NextResponse.json({ error: "Çekim bulunamadı." }, { status: 404 });
  }

  const updated = await prisma.shoot.findUnique({
    where: { id: params.id }
  });

  return NextResponse.json({ item: updated ? mapShootToRecord(updated) : null });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const prisma = resolvePrisma();

  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı başlatılamadı." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(prisma);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = isAdmin(user.email ?? "");
  const deleted = await prisma.shoot.deleteMany({
    where: getAccessFilter(params.id, user.id, adminUser)
  });

  if (!deleted.count) {
    return NextResponse.json({ error: "Çekim bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
