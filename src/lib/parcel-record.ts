import type { ParcelAnalysis, Prisma } from "@prisma/client";

import {
  parcelAnalysisRecordSchema,
  parcelBboxSchema,
  parcelCoordinatePointSchema,
  parcelInvestmentAnalysisSchema,
  parcelSocialCaptionsSchema,
  parcelVisualPromptSchema,
  type ParcelAnalysisRecord,
  type ParcelFeatureCollection
} from "@/types/parcel";

const EMPTY_GEOJSON: ParcelFeatureCollection = {
  type: "FeatureCollection",
  features: []
};

function isFeatureCollection(value: unknown): value is ParcelFeatureCollection {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as { type?: unknown }).type === "FeatureCollection" &&
    "features" in value &&
    Array.isArray((value as { features?: unknown }).features)
  );
}

export function toJsonInput(value: unknown) {
  return value as Prisma.InputJsonValue;
}

export function mapParcelAnalysisRecord(record: ParcelAnalysis): ParcelAnalysisRecord {
  const investmentAnalysis = record.investmentAnalysis
    ? parcelInvestmentAnalysisSchema.safeParse(record.investmentAnalysis).data ?? null
    : null;
  const socialCaptions = record.socialCaptions
    ? parcelSocialCaptionsSchema.safeParse(record.socialCaptions).data ?? null
    : null;
  const visualPrompts = Array.isArray(record.visualPrompts)
    ? record.visualPrompts
        .map((item) => parcelVisualPromptSchema.safeParse(item).data)
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : null;

  return parcelAnalysisRecordSchema.parse({
    id: record.id,
    shootId: record.shootId ?? null,
    originalFileName: record.originalFileName,
    geojson: isFeatureCollection(record.geojson) ? record.geojson : EMPTY_GEOJSON,
    kmlText: record.kmlText ?? null,
    areaM2: record.areaM2,
    areaDonum: Math.round((record.areaM2 / 1000) * 1000) / 1000,
    perimeterM: record.perimeterM,
    centroidLat: record.centroidLat,
    centroidLng: record.centroidLng,
    bbox: parcelBboxSchema.parse(record.bbox),
    cornerPoints: Array.isArray(record.cornerPoints)
      ? record.cornerPoints
          .map((item) => parcelCoordinatePointSchema.safeParse(item).data)
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      : [],
    geometryType: record.geometryType,
    approximateFrontageM: record.approximateFrontageM,
    adaNo: record.adaNo ?? null,
    parselNo: record.parselNo ?? null,
    il: record.il ?? null,
    ilce: record.ilce ?? null,
    marketingSummary: record.marketingSummary ?? null,
    investmentScore: record.investmentScore ?? null,
    investmentAnalysis,
    socialCaptions,
    visualPrompts,
    reportHtml: record.reportHtml ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  });
}
