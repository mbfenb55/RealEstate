import { NextResponse } from "next/server";
import { z } from "zod";

import { syncAuthUser } from "@/lib/auth-user";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { scheduleMockShootProcessing } from "@/lib/mock-processing";
import { getPrisma } from "@/lib/prisma";
import { mapShootToRecord } from "@/lib/shoots";
import { createClient } from "@/lib/supabase/server";

const createShootSchema = z.object({
  type: z.enum(["DRONE", "TOUR_3D", "COMBO"]),
  adaNo: z.string().min(1),
  parselNo: z.string().min(1),
  il: z.string().min(2),
  ilce: z.string().min(2),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  voiceoverText: z.string().optional(),
  logoUrl: z.string().optional(),
  phoneNumber: z.string().optional(),
  brandColor: z.string().optional(),
  nearbyLabels: z.any().optional(),
  landAnalysis: z.any().optional(),
  useCredits: z.boolean().optional().default(false),
  requiredCredits: z.number().optional().default(1)
});

type PrismaClientInstance = ReturnType<typeof getPrisma>;

function resolvePrisma(): PrismaClientInstance | null {
  try {
    return getPrisma();
  } catch (error) {
    console.error("Çekim API Prisma client initialization failed:", error);
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

  const profile = await syncAuthUser(user, prisma);
  return { user, profile };
}

export async function GET() {
  const prisma = resolvePrisma();

  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı başlatılamadı." }, { status: 503 });
  }

  const auth = await getAuthenticatedUser(prisma);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shoots = await prisma.shoot.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    items: shoots.map(mapShootToRecord)
  });
}

export async function POST(request: Request) {
  const prisma = resolvePrisma();

  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı başlatılamadı." }, { status: 503 });
  }

  const auth = await getAuthenticatedUser(prisma);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = createShootSchema.parse(await request.json());
  const creditsToCharge = Math.max(1, Math.ceil(payload.requiredCredits));

  if (payload.useCredits && auth.profile.credits < creditsToCharge) {
    return NextResponse.json({ error: "Yeterli krediniz bulunmuyor." }, { status: 402 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const shoot = await tx.shoot.create({
      data: {
        userId: auth.user.id,
        type: payload.type,
        adaNo: payload.adaNo,
        parselNo: payload.parselNo,
        il: payload.il,
        ilce: payload.ilce,
        latitude: payload.coordinates?.[1],
        longitude: payload.coordinates?.[0],
        voiceoverText: payload.voiceoverText,
        logoUrl: payload.logoUrl,
        phoneNumber: payload.phoneNumber,
        brandColor: payload.brandColor,
        nearbyLabels: payload.nearbyLabels ?? undefined,
        landAnalysis: payload.landAnalysis ?? undefined,
        status: "PROCESSING"
      }
    });

    let credits = auth.profile.credits;

    if (payload.useCredits) {
      const updatedUser = await tx.user.update({
        where: { id: auth.user.id },
        data: {
          credits: {
            decrement: creditsToCharge
          }
        }
      });
      credits = updatedUser.credits;
    }

    return { shoot, credits };
  });

  if (payload.useCredits) {
    scheduleMockShootProcessing(result.shoot.id);
  }

  return NextResponse.json(
    {
      shootId: result.shoot.id,
      item: mapShootToRecord(result.shoot),
      remainingCredits: result.credits
    },
    { status: 201 }
  );
}
