import type { Shoot } from "@prisma/client";

import type { NearbyPlace, ShootRecord } from "@/types";

const sampleVideoByType: Record<Shoot["type"], string> = {
  DRONE: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  TOUR_3D: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  COMBO: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
};

export type ShootLandAnalysis = {
  summary?: string;
  areaSqm?: number;
  zoningStatus?: string;
  estimatedValueRange?: {
    min: number;
    max: number;
    currency?: string;
  };
  reportPdfUrl?: string;
  nearbyPois?: NearbyPlace[];
};

type MappableShoot = Pick<
  Shoot,
  | "id"
  | "status"
  | "type"
  | "adaNo"
  | "parselNo"
  | "il"
  | "ilce"
  | "createdAt"
  | "videoUrl"
  | "audioUrl"
  | "voiceoverText"
  | "landAnalysis"
  | "latitude"
  | "longitude"
  | "viewCount"
  | "nearbyLabels"
  | "logoUrl"
  | "phoneNumber"
  | "brandColor"
  | "publicToken"
>;

function toNearbyPlaces(value: unknown): NearbyPlace[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is NearbyPlace => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const record = item as Record<string, unknown>;
      return (
        typeof record.id === "string" &&
        typeof record.name === "string" &&
        typeof record.distanceMeters === "number" &&
        typeof record.category === "string" &&
        typeof record.typeLabel === "string"
      );
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      distanceMeters: item.distanceMeters,
      category: item.category,
      typeLabel: item.typeLabel
    }));
}

export function normalizeLandAnalysis(
  value: unknown,
  fallbackNearby: NearbyPlace[] = [],
  type: Shoot["type"] = "DRONE"
) {
  const baseAnalysis = typeof value === "object" && value ? (value as Record<string, unknown>) : {};
  const areaSqm =
    typeof baseAnalysis.areaSqm === "number"
      ? baseAnalysis.areaSqm
      : 450 + fallbackNearby.length * 35 + (type === "COMBO" ? 180 : 0);
  const summary =
    typeof baseAnalysis.summary === "string" && baseAnalysis.summary.trim()
      ? baseAnalysis.summary
      : "Lokasyon, yakın çevre erişimi ve sunum potansiyeli açısından dengeli bir arsa profili sunuyor.";
  const zoningStatus =
    typeof baseAnalysis.zoningStatus === "string" && baseAnalysis.zoningStatus.trim()
      ? baseAnalysis.zoningStatus
      : type === "TOUR_3D"
        ? "Ticaret + Konut"
        : "Konut İmarlı";
  const reportPdfUrl =
    typeof baseAnalysis.reportPdfUrl === "string" && baseAnalysis.reportPdfUrl.trim()
      ? baseAnalysis.reportPdfUrl
      : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  const nearbyPois = toNearbyPlaces(baseAnalysis.nearbyPois ?? fallbackNearby);
  const estimatedValueRange =
    typeof baseAnalysis.estimatedValueRange === "object" && baseAnalysis.estimatedValueRange
      ? {
          min: Number((baseAnalysis.estimatedValueRange as Record<string, unknown>).min ?? 0),
          max: Number((baseAnalysis.estimatedValueRange as Record<string, unknown>).max ?? 0),
          currency: String((baseAnalysis.estimatedValueRange as Record<string, unknown>).currency ?? "TRY")
        }
      : {
          min: Math.round(areaSqm * 3250),
          max: Math.round(areaSqm * 4100),
          currency: "TRY"
        };

  return {
    summary,
    areaSqm,
    zoningStatus,
    estimatedValueRange,
    reportPdfUrl,
    nearbyPois
  } satisfies ShootLandAnalysis;
}

export function mapShootToRecord(shoot: MappableShoot): ShootRecord {
  const nearbyLabels = toNearbyPlaces(shoot.nearbyLabels);
  const landAnalysis = normalizeLandAnalysis(shoot.landAnalysis, nearbyLabels, shoot.type);

  return {
    id: shoot.id,
    title: `Ada ${shoot.adaNo} / Parsel ${shoot.parselNo}`,
    status: shoot.status,
    type: shoot.type,
    location: `${shoot.ilce}, ${shoot.il}`,
    city: shoot.il,
    district: shoot.ilce,
    createdAt: shoot.createdAt.toISOString(),
    creditsUsed: shoot.type === "COMBO" ? 2 : 1,
    viewCount: shoot.viewCount,
    previewVideoUrl: shoot.videoUrl ?? undefined,
    videoUrl: shoot.videoUrl ?? undefined,
    audioUrl: shoot.audioUrl ?? undefined,
    analysisSummary: landAnalysis.summary,
    voiceoverText: shoot.voiceoverText ?? undefined,
    coordinates:
      typeof shoot.latitude === "number" && typeof shoot.longitude === "number"
        ? ([shoot.longitude, shoot.latitude] as [number, number])
        : undefined,
    adaNo: shoot.adaNo,
    parselNo: shoot.parselNo,
    nearbyLabels,
    landAnalysis,
    publicToken: shoot.publicToken ?? undefined,
    logoUrl: shoot.logoUrl ?? undefined,
    phoneNumber: shoot.phoneNumber ?? undefined,
    brandColor: shoot.brandColor ?? undefined
  };
}

export function createMockCompletedPayload(shoot: {
  adaNo: string;
  parselNo: string;
  type: Shoot["type"];
  nearbyLabels: unknown;
  landAnalysis: unknown;
  il: string;
  ilce: string;
}) {
  const nearbyLabels = toNearbyPlaces(shoot.nearbyLabels);
  const existingAnalysis = normalizeLandAnalysis(shoot.landAnalysis, nearbyLabels, shoot.type);

  return {
    videoUrl: sampleVideoByType[shoot.type],
    landAnalysis: {
      ...existingAnalysis,
      summary:
        existingAnalysis.summary ??
        `${shoot.ilce}, ${shoot.il} lokasyonunda görünürlük ve erişim avantajı sunan dengeli bir portföy profili.`
    }
  };
}
