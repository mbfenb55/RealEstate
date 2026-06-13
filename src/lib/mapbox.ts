import { getMapboxPublicToken } from "@/lib/env";

export type GeocodeResult = {
  address: string;
  center: [number, number];
  city?: string;
  district?: string;
};

/**
 * Public Mapbox token bilgisini döndürür.
 */
export function getMapboxToken() {
  return getMapboxPublicToken();
}

/**
 * Verilen metin adresini Mapbox Geocoding API ile koordinata çevirir.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const token = getMapboxToken();

  if (!token || !query) {
    return null;
  }

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?limit=1&language=tr&access_token=${token}`,
    {
      next: { revalidate: 3600 }
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const feature = data.features?.[0];

  if (!feature) {
    return null;
  }

  const cityContext = feature.context?.find((item: { id: string }) => item.id.startsWith("place"));
  const districtContext = feature.context?.find((item: { id: string }) => item.id.startsWith("locality"));

  return {
    address: feature.place_name,
    center: feature.center,
    city: cityContext?.text,
    district: districtContext?.text
  };
}

/**
 * Belirli bir koordinat için sabit harita görseli URL’si üretir.
 */
export function createStaticMapUrl(longitude: number, latitude: number, zoom = 13) {
  const token = getMapboxToken();

  if (!token) {
    return "";
  }

  return `https://api.mapbox.com/styles/v1/mapbox/standard-satellite/static/pin-s+10b981(${longitude},${latitude})/${longitude},${latitude},${zoom},45/1200x720?access_token=${token}`;
}
