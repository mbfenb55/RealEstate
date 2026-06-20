import { NextResponse } from "next/server";
import { z } from "zod";

import { convertKmlTextToGeoJson, isSupportedKmlUpload } from "@/lib/kml";
import { calculateParcelMetrics } from "@/lib/parcel-metrics";
import { mapParcelAnalysisRecord, toJsonInput } from "@/lib/parcel-record";
import { buildScopedFilter, getAuthenticatedRequestContext, resolvePrisma } from "@/lib/server-auth";

export const runtime = "nodejs";

const uploadFormSchema = z.object({
  shootId: z.string().uuid().optional()
});

export async function POST(request: Request) {
  const prisma = resolvePrisma("Parcel upload");

  if (!prisma) {
    return NextResponse.json({ error: "Veritabani baglantisi baslatilamadi." }, { status: 503 });
  }

  const auth = await getAuthenticatedRequestContext(prisma);

  if (!auth) {
    return NextResponse.json({ error: "Oturum bulunamadi." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Lutfen bir KML dosyasi secin." }, { status: 400 });
    }

    if (!isSupportedKmlUpload(file.name, file.type)) {
      return NextResponse.json(
        { error: "Yalnizca gecerli .kml uzantili dosyalar yuklenebilir." },
        { status: 400 }
      );
    }

    const parsedForm = uploadFormSchema.safeParse({
      shootId: typeof formData.get("shootId") === "string" ? String(formData.get("shootId")) : undefined
    });

    if (!parsedForm.success) {
      return NextResponse.json({ error: "Gonderilen form verisi gecersiz." }, { status: 400 });
    }

    const kmlText = await file.text();

    if (!kmlText.trim()) {
      return NextResponse.json({ error: "KML dosyasi bos gorunuyor." }, { status: 400 });
    }

    const connectedShoot = parsedForm.data.shootId
      ? await prisma.shoot.findFirst({
          where: buildScopedFilter(parsedForm.data.shootId, auth.user.id, auth.adminUser)
        })
      : null;

    if (parsedForm.data.shootId && !connectedShoot) {
      return NextResponse.json({ error: "Baglanmak istenen cekim bulunamadi." }, { status: 404 });
    }

    const { geojson, metadata } = convertKmlTextToGeoJson(kmlText);
    const metrics = calculateParcelMetrics(geojson);

    const created = await prisma.parcelAnalysis.create({
      data: {
        userId: auth.user.id,
        shootId: parsedForm.data.shootId,
        originalFileName: file.name,
        geojson: toJsonInput(geojson),
        kmlText,
        areaM2: metrics.areaM2,
        perimeterM: metrics.perimeterM,
        centroidLat: metrics.centroidLat,
        centroidLng: metrics.centroidLng,
        bbox: toJsonInput(metrics.bbox),
        cornerPoints: toJsonInput(metrics.cornerPoints),
        geometryType: metrics.geometryType,
        approximateFrontageM: metrics.approximateFrontageM,
        adaNo: metadata.adaNo ?? connectedShoot?.adaNo,
        parselNo: metadata.parselNo ?? connectedShoot?.parselNo,
        il: metadata.il ?? connectedShoot?.il,
        ilce: metadata.ilce ?? connectedShoot?.ilce
      }
    });

    return NextResponse.json(
      {
        message: "Parsel basariyla analiz edildi.",
        item: mapParcelAnalysisRecord(created)
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Parcel upload failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "KML dosyasi islenirken beklenmeyen bir hata olustu.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
