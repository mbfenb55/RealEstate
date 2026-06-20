import { NextResponse } from "next/server";

import { mapParcelAnalysisRecord } from "@/lib/parcel-record";
import { buildScopedFilter, getAuthenticatedRequestContext, resolvePrisma } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const prisma = resolvePrisma("Parcel detail");

  if (!prisma) {
    return NextResponse.json({ error: "Veritabani baglantisi baslatilamadi." }, { status: 503 });
  }

  const auth = await getAuthenticatedRequestContext(prisma);

  if (!auth) {
    return NextResponse.json({ error: "Oturum bulunamadi." }, { status: 401 });
  }

  const record = await prisma.parcelAnalysis.findFirst({
    where: buildScopedFilter(params.id, auth.user.id, auth.adminUser)
  });

  if (!record) {
    return NextResponse.json({ error: "Parsel analizi bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({
    item: mapParcelAnalysisRecord(record)
  });
}
