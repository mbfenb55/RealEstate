import { NextResponse } from "next/server";

import { retrieveCheckoutForm } from "@/lib/iyzico";
import { scheduleMockShootProcessing } from "@/lib/mock-processing";
import { getPrisma } from "@/lib/prisma";
import { sendPaymentSuccessEmail } from "@/lib/resend";

async function resolvePayload(request: Request) {
  const url = new URL(request.url);
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return {
      token: String(formData.get("token") ?? url.searchParams.get("token") ?? ""),
      conversationId: String(formData.get("conversationId") ?? url.searchParams.get("conversationId") ?? "")
    };
  }

  if (contentType.includes("application/json")) {
    const body = await request.json();
    return {
      token: String(body.token ?? url.searchParams.get("token") ?? ""),
      conversationId: String(body.conversationId ?? url.searchParams.get("conversationId") ?? "")
    };
  }

  return {
    token: String(url.searchParams.get("token") ?? ""),
    conversationId: String(url.searchParams.get("conversationId") ?? "")
  };
}

function resolvePrisma(): ReturnType<typeof getPrisma> | null {
  try {
    return getPrisma();
  } catch (error) {
    console.error("Ödeme callback Prisma client initialization failed:", error);
    return null;
  }
}

async function handleCallback(request: Request) {
  const payload = await resolvePayload(request);

  if (!payload.token) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 });
  }

  const prisma = resolvePrisma();

  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı başlatılamadı." }, { status: 503 });
  }

  const result = await retrieveCheckoutForm(payload.token, payload.conversationId);
  const payment = await prisma.payment.findFirst({
    where: {
      iyzicoToken: payload.token
    },
    include: {
      user: true
    }
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const isSuccess = result.paymentStatus === "SUCCESS";

  await prisma.$transaction(async (tx) => {
    const currentPayment = await tx.payment.findUnique({
      where: { id: payment.id }
    });

    if (!currentPayment) {
      return;
    }

    if (isSuccess && currentPayment.status !== "SUCCESS") {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          iyzicoToken: payload.token
        }
      });

      await tx.user.update({
        where: { id: payment.userId },
        data: {
          credits: {
            increment: currentPayment.creditsAdded
          }
        }
      });
    } else if (!isSuccess) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          iyzicoToken: payload.token
        }
      });
    }

    if (result.basketId) {
      await tx.shoot.updateMany({
        where: {
          id: result.basketId,
          userId: payment.userId
        },
        data: {
          status: isSuccess ? "PROCESSING" : "FAILED"
        }
      });
    }

    if (isSuccess) {
      const existingInvoice = await tx.invoice.findFirst({
        where: { paymentId: payment.id }
      });

      if (!existingInvoice) {
        await tx.invoice.create({
          data: {
            userId: payment.userId,
            paymentId: payment.id,
            amount: Number(result.paidPrice ?? payment.amount)
          }
        });
      }
    }
  });

  if (isSuccess) {
    if (result.basketId) {
      scheduleMockShootProcessing(result.basketId);
    }

    await sendPaymentSuccessEmail(payment.user.email, {
      planName: "Parselim kredi paketi",
      amount: Number(result.paidPrice ?? payment.amount)
    });
  }

  const redirectUrl = new URL(
    isSuccess ? "/dashboard/faturalar?payment=success" : "/dashboard/faturalar?payment=failed",
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin
  );

  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: Request) {
  return handleCallback(request);
}

export async function POST(request: Request) {
  return handleCallback(request);
}
