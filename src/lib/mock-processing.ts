import { getPrisma } from "@/lib/prisma";
import { createMockCompletedPayload } from "@/lib/shoots";

const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

function resolvePrisma(): ReturnType<typeof getPrisma> | null {
  try {
    return getPrisma();
  } catch (error) {
    console.error("Mock shoot Prisma client initialization failed:", error);
    return null;
  }
}

export function scheduleMockShootProcessing(shootId: string) {
  if (pendingTimers.has(shootId)) {
    return;
  }

  const timer = setTimeout(async () => {
    pendingTimers.delete(shootId);

    const prisma = resolvePrisma();

    if (!prisma) {
      return;
    }

    try {
      const shoot = await prisma.shoot.findUnique({
        where: { id: shootId }
      });

      if (!shoot || shoot.status !== "PROCESSING") {
        return;
      }

      const completedPayload = createMockCompletedPayload(shoot);

      await prisma.shoot.update({
        where: { id: shootId },
        data: {
          status: "READY",
          videoUrl: completedPayload.videoUrl,
          landAnalysis: completedPayload.landAnalysis,
          completedAt: new Date()
        }
      });
    } catch (error) {
      console.error("Mock shoot processing failed", error);

      await prisma.shoot.updateMany({
        where: {
          id: shootId,
          status: "PROCESSING"
        },
        data: {
          status: "FAILED"
        }
      });
    }
  }, 8000);

  pendingTimers.set(shootId, timer);
}
