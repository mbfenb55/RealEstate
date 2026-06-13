import { NextResponse } from "next/server";
import { z } from "zod";

import { getNearbyPlaces } from "@/lib/google-places";
import { createStaticMapUrl, geocodeAddress } from "@/lib/mapbox";

const schema = z.object({
  intent: z.enum(["validate", "nearby"]).default("validate"),
  adaNo: z.string().optional(),
  parselNo: z.string().optional(),
  il: z.string().optional(),
  ilce: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  propertyType: z.string().optional().default("arsa")
});

const cityScores: Record<string, { investment: number; accessibility: number; tourism: number }> = {
  İstanbul: { investment: 91, accessibility: 94, tourism: 72 },
  Muğla: { investment: 86, accessibility: 76, tourism: 96 },
  Ankara: { investment: 82, accessibility: 90, tourism: 58 },
  İzmir: { investment: 88, accessibility: 87, tourism: 84 },
  Antalya: { investment: 90, accessibility: 85, tourism: 95 }
};

function deriveOffset(base: number, seed: string, precision: number) {
  const numericSeed = Number.parseInt(seed.replace(/\D/g, "").slice(0, 6) || "0", 10);
  return base + ((numericSeed % 23) - 11) * precision;
}

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());

  const locationQuery = payload.ilce && payload.il ? `${payload.ilce}, ${payload.il}, Türkiye` : payload.il ?? "İstanbul";
  const geocoded = payload.coordinates ? null : await geocodeAddress(locationQuery);
  const baseCoordinates = payload.coordinates ?? geocoded?.center ?? [28.9784, 41.0082];
  const coordinates: [number, number] = [
    deriveOffset(baseCoordinates[0], payload.adaNo ?? payload.parselNo ?? "0", 0.0015),
    deriveOffset(baseCoordinates[1], payload.parselNo ?? payload.adaNo ?? "0", 0.0012)
  ];

  if (payload.intent === "nearby") {
    const nearby = await getNearbyPlaces(coordinates);
    return NextResponse.json({
      coordinates,
      nearby
    });
  }

  const city = payload.il ?? geocoded?.city ?? "İstanbul";
  const district = payload.ilce ?? geocoded?.district ?? "Merkez";
  const base = cityScores[city] ?? { investment: 78, accessibility: 74, tourism: 66 };
  const droneSuitability = Math.min(95, Math.round((base.accessibility + base.tourism) / 2));
  const mapSnapshot = createStaticMapUrl(coordinates[0], coordinates[1]);
  const neighborhoodSummary = `${district}, ${city} çevresinde ulaşım ve görünürlük dengesi güçlü. ${payload.propertyType} için dijital tanıtım çıktısı üretmeye uygun bir lokasyon özeti elde edildi.`;

  return NextResponse.json({
    resolvedAddress: geocoded?.address ?? `${district}, ${city}`,
    coordinates,
    neighborhoodSummary,
    scores: {
      investmentPotential: base.investment,
      accessibility: base.accessibility,
      tourismPotential: base.tourism,
      droneSuitability
    },
    summary: neighborhoodSummary,
    mapSnapshot,
    suggestions: [
      "Videoda yaklaşım sahnesinden sonra parsel çevresini gösterin.",
      "Seslendirmede ilçe ve ulaşım avantajını ilk 20 saniyede verin.",
      "Yakın çevre etiketlerini öne çıkan yerlere göre seçin."
    ]
  });
}
