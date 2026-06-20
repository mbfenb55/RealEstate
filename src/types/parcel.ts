import type { FeatureCollection, Geometry } from "geojson";
import { z } from "zod";

export type ParcelFeatureCollection = FeatureCollection<Geometry>;

export const parcelCoordinatePointSchema = z.object({
  pointNo: z.number().int().positive(),
  lat: z.number(),
  lng: z.number()
});

export const parcelBboxSchema = z.object({
  west: z.number(),
  south: z.number(),
  east: z.number(),
  north: z.number()
});

export const parcelMetadataSchema = z.object({
  adaNo: z.string().nullable().optional(),
  parselNo: z.string().nullable().optional(),
  il: z.string().nullable().optional(),
  ilce: z.string().nullable().optional()
});

export const parcelMetricsSchema = z.object({
  areaM2: z.number().nonnegative(),
  areaDonum: z.number().nonnegative(),
  perimeterM: z.number().nonnegative(),
  centroidLat: z.number(),
  centroidLng: z.number(),
  bbox: parcelBboxSchema,
  cornerPoints: z.array(parcelCoordinatePointSchema).min(3),
  geometryType: z.string().min(1),
  approximateFrontageM: z.number().nonnegative()
});

export const parcelInvestmentAnalysisSchema = z.object({
  investmentAdvantages: z.array(z.string()).default([]),
  cautions: z.array(z.string()).default([]),
  targetBuyerProfile: z.string().default("")
});

export const parcelSocialCaptionsSchema = z.object({
  instagram: z.string().default(""),
  sahibinden: z.string().default(""),
  whatsapp: z.string().default(""),
  reels: z.string().default("")
});

export const parcelVisualPromptSchema = z.object({
  title: z.string(),
  usageArea: z.string(),
  prompt: z.string(),
  negativePrompt: z.string(),
  aspectRatio: z.string()
});

export const parcelAiResultSchema = z.object({
  marketingSummary: z.string(),
  investmentScore: z.number().int().min(0).max(100),
  investmentAnalysis: parcelInvestmentAnalysisSchema,
  socialCaptions: parcelSocialCaptionsSchema,
  visualPrompts: z.array(parcelVisualPromptSchema).length(6),
  reportHtml: z.string()
});

export const parcelAnalysisRecordSchema = z.object({
  id: z.string(),
  shootId: z.string().nullable().optional(),
  originalFileName: z.string(),
  geojson: z.custom<ParcelFeatureCollection>(),
  kmlText: z.string().nullable().optional(),
  areaM2: z.number(),
  areaDonum: z.number(),
  perimeterM: z.number(),
  centroidLat: z.number(),
  centroidLng: z.number(),
  bbox: parcelBboxSchema,
  cornerPoints: z.array(parcelCoordinatePointSchema),
  geometryType: z.string(),
  approximateFrontageM: z.number(),
  adaNo: z.string().nullable().optional(),
  parselNo: z.string().nullable().optional(),
  il: z.string().nullable().optional(),
  ilce: z.string().nullable().optional(),
  marketingSummary: z.string().nullable().optional(),
  investmentScore: z.number().int().nullable().optional(),
  investmentAnalysis: parcelInvestmentAnalysisSchema.nullable().optional(),
  socialCaptions: parcelSocialCaptionsSchema.nullable().optional(),
  visualPrompts: z.array(parcelVisualPromptSchema).nullable().optional(),
  reportHtml: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const parcelAnalyzeRequestSchema = z.object({
  id: z.string().uuid("Gecersiz analiz kimligi.")
});

export type ParcelCoordinatePoint = z.infer<typeof parcelCoordinatePointSchema>;
export type ParcelBbox = z.infer<typeof parcelBboxSchema>;
export type ParcelMetadata = z.infer<typeof parcelMetadataSchema>;
export type ParcelMetrics = z.infer<typeof parcelMetricsSchema>;
export type ParcelInvestmentAnalysis = z.infer<typeof parcelInvestmentAnalysisSchema>;
export type ParcelSocialCaptions = z.infer<typeof parcelSocialCaptionsSchema>;
export type ParcelVisualPrompt = z.infer<typeof parcelVisualPromptSchema>;
export type ParcelAiResult = z.infer<typeof parcelAiResultSchema>;
export type ParcelAnalysisRecord = z.infer<typeof parcelAnalysisRecordSchema>;
