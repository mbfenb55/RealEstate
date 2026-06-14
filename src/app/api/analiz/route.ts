import { NextResponse } from "next/server";
import { z } from "zod";

import { getNearbyPlaces } from "@/lib/google-places";
import { createStaticMapUrl } from "@/lib/mapbox";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
};

const schema = z.object({
  intent: z.enum(["validate", "nearby"]).default("validate"),
  adaNo: z.string().optional(),
  parselNo: z.string().optional(),
  il: z.string().trim().optional(),
  ilce: z.string().trim().optional(),
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

function resolveDisplayLocation(il?: string, ilce?: string) {
  return [ilce?.trim(), il?.trim()].filter(Boolean).join(", ");
}

async function geocodeWithNominatim(il?: string, ilce?: string) {
  const queries = [
    resolveDisplayLocation(il, ilce),
    il?.trim() ? `${il.trim()} Turkey` : ""
  ].filter((query): query is string => Boolean(query));

  for (const query of queries) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      countrycodes: "tr"
    }).toString();

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "tr-TR,tr;q=0.9",
        "User-Agent": "Parselim/1.0 (support@parselim.com)"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      continue;
    }

    const data = (await response.json()) as NominatimResult[];
    const firstResult = data[0];

    if (!firstResult) {
      continue;
    }

    const latitude = Number(firstResult.lat);
    const longitude = Number(firstResult.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      continue;
    }

    return {
      coordinates: [longitude, latitude] as [number, number],
      resolvedAddress: firstResult.display_name ?? query
    };
  }

  return null;
}

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());
  const resolvedLocation = payload.coordinates
    ? {
        coordinates: payload.coordinates,
        resolvedAddress: resolveDisplayLocation(payload.il, payload.ilce) || "Belirtilen konum"
      }
    : await geocodeWithNominatim(payload.il, payload.ilce);

  if (!resolvedLocation) {
    return NextResponse.json(
      {
        error: "Konum OpenStreetMap ile çözümlenemedi. İl ve ilçe bilgilerini kontrol edin."
      },
      { status: 400 }
    );
  }

  const coordinates = resolvedLocation.coordinates;
  const city = payload.il?.trim() ?? "";
  const district = payload.ilce?.trim() ?? "";
  const locationLabel = resolveDisplayLocation(city, district) || resolvedLocation.resolvedAddress;
  const base = cityScores[city] ?? { investment: 78, accessibility: 74, tourism: 66 };
  const droneSuitability = Math.min(95, Math.round((base.accessibility + base.tourism) / 2));
  const mapSnapshot = createStaticMapUrl(coordinates[0], coordinates[1]);
  const neighborhoodSummary = `${locationLabel} çevresinde ulaşım ve görünürlük dengesi güçlü. ${payload.propertyType} için dijital tanıtım çıktısı üretmeye uygun bir lokasyon özeti hazırlandı.`;

  if (payload.intent === "nearby") {
    const nearby = await getNearbyPlaces(coordinates);
    return NextResponse.json({
      coordinates,
      neighborhoodSummary,
      nearby
    });
  }

  return NextResponse.json({
    resolvedAddress: resolvedLocation.resolvedAddress,
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
