import { NextResponse } from "next/server";
import { z } from "zod";

import { PAYMENTS_ENABLED } from "@/lib/features";
import { getPrisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["shoot.completed", "payment.succeeded", "payment.failed"]),
  payload: z.record(z.any())
});

function resolvePrisma(): ReturnType<typeof getPrisma> | null {
  try {
    return getPrisma();
  } catch (error) {
    console.error("Webhook Prisma client initialization failed:", error);
    return null;
  }
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");

  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  const prisma = resolvePrisma();

  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı başlatılamadı." }, { status: 503 });
  }

  const event = schema.parse(await request.json());

  if (!PAYMENTS_ENABLED && event.type.startsWith("payment.")) {
    return NextResponse.json({ received: true, skipped: true });
  }

  switch (event.type) {
    case "shoot.completed": {
      await prisma.shoot.update({
        where: { id: String(event.payload.shootId) },
        data: {
          status: "READY",
          videoUrl: String(event.payload.videoUrl ?? event.payload.previewVideoUrl ?? ""),
          audioUrl: String(event.payload.audioUrl ?? event.payload.voiceoverAudioUrl ?? ""),
          landAnalysis: event.payload.analysis ?? undefined,
          completedAt: new Date()
        }
      });
      break;
    }
    case "payment.succeeded": {
      const paymentId = String(event.payload.paymentId);
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (payment && payment.status !== "SUCCESS") {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: paymentId },
            data: { status: "SUCCESS" }
          }),
          prisma.user.update({
            where: { id: payment.userId },
            data: {
              credits: {
                increment: payment.creditsAdded
              }
            }
          })
        ]);
      }
      break;
    }
    case "payment.failed": {
      await prisma.payment.update({
        where: { id: String(event.payload.paymentId) },
        data: { status: "FAILED" }
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
