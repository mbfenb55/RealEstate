import { NextResponse } from "next/server";
import { z } from "zod";

import { syncAuthUser } from "@/lib/auth-user";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { initializeCheckoutForm } from "@/lib/iyzico";
import { getPrisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const creditPlanMap: Record<string, number> = {
  "1 Çekim": 1,
  "5 Çekim": 5,
  "10 Çekim": 10,
  Starter: 1,
  Profesyonel: 5,
  Kurumsal: 15,
  Başlangıç: 1
};

const schema = z.object({
  planName: z.string(),
  amount: z.number().positive(),
  shootId: z.string().uuid().optional()
});

function resolvePrisma(): ReturnType<typeof getPrisma> | null {
  try {
    return getPrisma();
  } catch (error) {
    console.error("Ödeme başlat Prisma client initialization failed:", error);
    return null;
  }
}

export async function POST(request: Request) {
  if (!hasPublicSupabaseEnv()) {
    return NextResponse.json(
      { error: "Ödeme altyapısı yerel önizleme için devre dışı. Gerçek Supabase bilgileri gerekiyor." },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = resolvePrisma();

  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı başlatılamadı." }, { status: 503 });
  }

  await syncAuthUser(user, prisma);

  const payload = schema.parse(await request.json());
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "85.34.78.112";
  const fullName = String(user.user_metadata?.full_name ?? "Parselim Kullanıcı");
  const [name = "Parselim", ...surnameParts] = fullName.split(" ");
  const surname = surnameParts.join(" ") || "Kullanıcı";

  const checkout = await initializeCheckoutForm({
    conversationId: `iyz-${Date.now()}`,
    price: payload.amount,
    paidPrice: payload.amount,
    basketId: payload.shootId ?? `basket-${Date.now()}`,
    callbackUrl: process.env.IYZICO_CALLBACK_URL ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/odeme/callback`,
    buyer: {
      id: user.id,
      name,
      surname,
      identityNumber: String(user.user_metadata?.identity_number ?? "11111111111"),
      email: user.email,
      gsmNumber: String(user.user_metadata?.phone ?? "+905350000000"),
      registrationDate: new Date().toISOString().slice(0, 19).replace("T", " "),
      lastLoginDate: new Date().toISOString().slice(0, 19).replace("T", " "),
      registrationAddress: String(user.user_metadata?.address ?? "İstanbul, Türkiye"),
      city: String(user.user_metadata?.city ?? "İstanbul"),
      country: "Turkey",
      zipCode: String(user.user_metadata?.zip_code ?? "34000"),
      ip: ipAddress
    },
    billingAddress: {
      address: String(user.user_metadata?.address ?? "İstanbul, Türkiye"),
      zipCode: String(user.user_metadata?.zip_code ?? "34000"),
      contactName: fullName,
      city: String(user.user_metadata?.city ?? "İstanbul"),
      country: "Turkey"
    },
    basketItems: [
      {
        id: payload.shootId ?? `basket-${Date.now()}`,
        name: `${payload.planName} Ödemesi`,
        category1: "SaaS",
        category2: "Shoot",
        itemType: "VIRTUAL",
        price: payload.amount
      }
    ]
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: payload.amount,
      creditsAdded: creditPlanMap[payload.planName] ?? 0,
      iyzicoToken: checkout.token,
      status: "PENDING"
    }
  });

  return NextResponse.json({
    paymentPageUrl: checkout.paymentPageUrl,
    token: checkout.token
  });
}
