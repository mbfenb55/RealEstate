import type { NearbyPlace } from "@/types";

type GoogleNearbyResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    types?: string[];
    shortFormattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
  }>;
};

const CATEGORY_CONFIG = [
  {
    label: "Ulaşım" as const,
    types: ["transit_station", "subway_station", "bus_station"]
  },
  {
    label: "Eğitim" as const,
    types: ["school", "university"]
  },
  {
    label: "Sağlık" as const,
    types: ["hospital", "doctor", "pharmacy"]
  },
  {
    label: "Alışveriş" as const,
    types: ["shopping_mall", "supermarket", "store"]
  },
  {
    label: "Parklar" as const,
    types: ["park"]
  },
  {
    label: "Restoranlar" as const,
    types: ["restaurant", "cafe"]
  }
] as const;

function haversineDistance(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return Math.round(2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function getNearbyPlaces(coordinates: [number, number]) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return CATEGORY_CONFIG.flatMap((category, categoryIndex) =>
      Array.from({ length: 2 }, (_, index) => ({
        id: `${category.label}-${index}`,
        name: `${category.label} Noktası ${index + 1}`,
        distanceMeters: 180 + categoryIndex * 220 + index * 160,
        category: category.label,
        typeLabel: category.label
      }))
    );
  }

  const results = await Promise.all(
    CATEGORY_CONFIG.map(async (category) => {
      const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.types,places.shortFormattedAddress,places.location"
        },
        body: JSON.stringify({
          includedTypes: category.types,
          maxResultCount: 4,
          rankPreference: "DISTANCE",
          locationRestriction: {
            circle: {
              center: {
                latitude: coordinates[1],
                longitude: coordinates[0]
              },
              radius: 3500
            }
          }
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        return [] as NearbyPlace[];
      }

      const data = (await response.json()) as GoogleNearbyResponse;

      return (data.places ?? []).map((place, index) => {
        const placeCoordinates: [number, number] = [
          place.location?.longitude ?? coordinates[0],
          place.location?.latitude ?? coordinates[1]
        ];

        return {
          id: place.id ?? `${category.label}-${index}`,
          name: place.displayName?.text ?? place.shortFormattedAddress ?? `${category.label} ${index + 1}`,
          distanceMeters: haversineDistance(coordinates, placeCoordinates),
          category: category.label,
          typeLabel: place.types?.[0]?.replaceAll("_", " ") ?? category.label
        } satisfies NearbyPlace;
      });
    })
  );

  return results.flat().sort((a, b) => a.distanceMeters - b.distanceMeters);
}
