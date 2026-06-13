import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateDistanceMeters, calculateValueScore, type OverpassCategory, type OverpassKind, type OverpassPlace } from "@/lib/value-score";

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
};

const schema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number().int().positive().max(5000).default(1000)
});

const emptyCategorized: Record<OverpassCategory, OverpassPlace[]> = {
  Ulaşım: [],
  Eğitim: [],
  Sağlık: [],
  Alışveriş: [],
  Parklar: [],
  Restoranlar: []
};

function normalizeTags(tags: Record<string, string | undefined> | undefined) {
  const normalized: Record<string, string> = {};

  if (!tags) {
    return normalized;
  }

  for (const [key, value] of Object.entries(tags)) {
    if (typeof value === "string") {
      normalized[key] = value;
    }
  }

  return normalized;
}

function classifyPlace(tags: Record<string, string>) {
  if (tags.amenity === "school") {
    return { category: "Eğitim" as const, kind: "school" as const, typeLabel: "Okul" };
  }

  if (tags.amenity === "hospital") {
    return { category: "Sağlık" as const, kind: "hospital" as const, typeLabel: "Hastane" };
  }

  if (tags.amenity === "pharmacy") {
    return { category: "Sağlık" as const, kind: "pharmacy" as const, typeLabel: "Eczane" };
  }

  if (tags.amenity === "supermarket") {
    return { category: "Alışveriş" as const, kind: "supermarket" as const, typeLabel: "Süpermarket" };
  }

  if (tags.amenity === "restaurant") {
    return { category: "Restoranlar" as const, kind: "restaurant" as const, typeLabel: "Restoran" };
  }

  if (tags.leisure === "park") {
    return { category: "Parklar" as const, kind: "park" as const, typeLabel: "Park" };
  }

  if (tags.highway === "bus_stop") {
    return { category: "Ulaşım" as const, kind: "bus" as const, typeLabel: "Otobüs Durağı" };
  }

  if (tags.public_transport === "station") {
    return { category: "Ulaşım" as const, kind: "metro" as const, typeLabel: "Toplu Taşıma İstasyonu" };
  }

  if (tags.railway === "tram_stop") {
    return { category: "Ulaşım" as const, kind: "tram" as const, typeLabel: "Tramvay Durağı" };
  }

  if (tags.railway === "subway_entrance" || tags.subway === "yes" || tags.station === "subway") {
    return { category: "Ulaşım" as const, kind: "metro" as const, typeLabel: "Metro" };
  }

  if (tags.railway === "station") {
    const typeLabel = /tram/i.test(tags.station ?? "") ? "Tramvay İstasyonu" : "İstasyon";
    return { category: "Ulaşım" as const, kind: /tram/i.test(typeLabel) ? "tram" as const : "metro" as const, typeLabel };
  }

  return null;
}

function elementToPlace(element: OverpassElement, centerLatitude: number, centerLongitude: number) {
  if (typeof element.lat !== "number" || typeof element.lon !== "number" || !element.tags) {
    return null;
  }

  const tags = normalizeTags(element.tags);
  const classification = classifyPlace(tags);

  if (!classification) {
    return null;
  }

  const name = tags.name || tags.brand || tags.operator || tags.ref || classification.typeLabel;
  const distanceMeters = calculateDistanceMeters(centerLatitude, centerLongitude, element.lat, element.lon);

  return {
    id: `${classification.kind}-${element.id}`,
    name,
    category: classification.category,
    kind: classification.kind,
    typeLabel: classification.typeLabel,
    distanceMeters,
    latitude: element.lat,
    longitude: element.lon,
    tags
  } satisfies OverpassPlace;
}

function buildQuery(latitude: number, longitude: number, radius: number) {
  return `
    [out:json][timeout:25];
    (
      node["amenity"~"school|hospital|pharmacy|supermarket|restaurant"](around:${radius},${latitude},${longitude});
      node["public_transport"="station"](around:${radius},${latitude},${longitude});
      node["highway"="bus_stop"](around:${radius},${latitude},${longitude});
      node["leisure"="park"](around:${radius},${latitude},${longitude});
      node["railway"~"station|subway_entrance|tram_stop"](around:${radius},${latitude},${longitude});
    );
    out body;
  `;
}

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const radius = Math.min(Math.max(payload.radius ?? 1000, 100), 5000);
    const query = buildQuery(payload.latitude, payload.longitude, radius);
    const overpassResponse = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: new URLSearchParams({ data: query })
    });

    if (!overpassResponse.ok) {
      throw new Error(`Overpass API isteği başarısız oldu: ${overpassResponse.status}`);
    }

    const overpassData = (await overpassResponse.json()) as { elements?: OverpassElement[] };
    const nearbyPlaces = (overpassData.elements ?? [])
      .map((element) => elementToPlace(element, payload.latitude, payload.longitude))
      .filter((place): place is OverpassPlace => Boolean(place))
      .sort((left, right) => left.distanceMeters - right.distanceMeters);

    const score = calculateValueScore(nearbyPlaces);
    const categorized = nearbyPlaces.reduce<Record<OverpassCategory, OverpassPlace[]>>((accumulator, place) => {
      accumulator[place.category].push(place);
      return accumulator;
    }, structuredClone(emptyCategorized));

    return NextResponse.json({
      center: {
        latitude: payload.latitude,
        longitude: payload.longitude
      },
      radius,
      nearbyPlaces: nearbyPlaces.slice(0, 80),
      categorized,
      valueScore: score
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Yakın çevre analizi yapılamadı."
      },
      { status: 400 }
    );
  }
}
