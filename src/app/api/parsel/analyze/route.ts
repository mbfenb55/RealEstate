import { NextResponse } from "next/server";
import { z } from "zod";

import { generateParcelAiContent } from "@/lib/parcel-ai";
import { mapParcelAnalysisRecord, toJsonInput } from "@/lib/parcel-record";
import { buildScopedFilter, getAuthenticatedRequestContext, resolvePrisma } from "@/lib/server-auth";
import { parcelAnalyzeRequestSchema } from "@/types/parcel";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const prisma = resolvePrisma("Parcel analyze");

  if (!prisma) {
    return NextResponse.json({ error: "Veritabani baglantisi baslatilamadi." }, { status: 503 });
  }

  const auth = await getAuthenticatedRequestContext(prisma);

  if (!auth) {
    return NextResponse.json({ error: "Oturum bulunamadi." }, { status: 401 });
  }

  try {
    const payload = parcelAnalyzeRequestSchema.parse(await request.json());
    const record = await prisma.parcelAnalysis.findFirst({
      where: buildScopedFilter(payload.id, auth.user.id, auth.adminUser)
    });

    if (!record) {
      return NextResponse.json({ error: "Parsel analizi bulunamadi." }, { status: 404 });
    }

    const mappedRecord = mapParcelAnalysisRecord(record);
    const aiResult = await generateParcelAiContent(mappedRecord);
    const updated = await prisma.parcelAnalysis.update({
      where: { id: record.id },
      data: {
        marketingSummary: aiResult.marketingSummary,
        investmentScore: aiResult.investmentScore,
        investmentAnalysis: toJsonInput(aiResult.investmentAnalysis),
        socialCaptions: toJsonInput(aiResult.socialCaptions),
        visualPrompts: toJsonInput(aiResult.visualPrompts),
        reportHtml: aiResult.reportHtml
      }
    });

    return NextResponse.json({
      message: "Pazarlama analizi hazirlandi.",
      item: mapParcelAnalysisRecord(updated)
    });
  } catch (error) {
    console.error("Parcel analyze failed:", error);

    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Gonderilen analiz istegi gecersiz."
        : error instanceof Error
          ? error.message
          : "Parsel analizi uretilirken bir hata olustu.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
