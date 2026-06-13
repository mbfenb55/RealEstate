import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["shoot.completed", "payment.succeeded", "payment.failed"]),
  payload: z.record(z.any())
});

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");

  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  const event = schema.parse(await request.json());

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
