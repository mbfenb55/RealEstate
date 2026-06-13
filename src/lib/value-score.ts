export type OverpassCategory = "Ulaşım" | "Eğitim" | "Sağlık" | "Alışveriş" | "Parklar" | "Restoranlar";

export type OverpassKind =
  | "metro"
  | "tram"
  | "bus"
  | "school"
  | "hospital"
  | "pharmacy"
  | "supermarket"
  | "park"
  | "restaurant";

export type OverpassPlace = {
  id: string;
  name: string;
  category: OverpassCategory;
  kind: OverpassKind;
  typeLabel: string;
  distanceMeters: number;
  latitude: number;
  longitude: number;
  tags: Record<string, string>;
};

export type ScoreItem = {
  key: string;
  label: string;
  points: number;
  active: boolean;
  details: string;
};

export type ValueScoreResult = {
  score: number;
  breakdown: ScoreItem[];
  label: string;
};

/**
 * İki koordinat arasındaki haversine mesafesini metre cinsinden hesaplar.
 */
export function calculateDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const radius = 6_371_000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLatitude = toRadians(latitudeB - latitudeA);
  const deltaLongitude = toRadians(longitudeB - longitudeA);
  const originLatitude = toRadians(latitudeA);
  const targetLatitude = toRadians(latitudeB);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(targetLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * radius * Math.asin(Math.sqrt(haversine));
}

function buildLabel(score: number) {
  if (score <= 30) {
    return "Düşük Potansiyel";
  }

  if (score <= 60) {
    return "Orta Potansiyel";
  }

  if (score <= 80) {
    return "Yüksek Potansiyel";
  }

  return "Premium Lokasyon";
}

function joinPlaceNames(places: OverpassPlace[]) {
  return places
    .map((place) => `${place.name} (${Math.round(place.distanceMeters)} m)`)
    .slice(0, 4)
    .join(", ");
}

function getClosestPlace(places: OverpassPlace[], predicate: (place: OverpassPlace) => boolean) {
  return places
    .filter(predicate)
    .sort((left, right) => left.distanceMeters - right.distanceMeters)[0];
}

/**
 * Yakın çevre verisine göre lokasyon değer skorunu hesaplar.
 */
export function calculateValueScore(nearbyPlaces: OverpassPlace[]): ValueScoreResult {
  const breakdown: ScoreItem[] = [];
  let score = 0;

  const transportPlaces = nearbyPlaces.filter(
    (place) =>
      place.kind === "metro" ||
      place.kind === "tram" ||
      (place.category === "Ulaşım" && /metro|tram|istasyon|station/i.test(place.typeLabel))
  );
  const transportClose = transportPlaces.filter((place) => place.distanceMeters <= 500);
  const transportPoints = transportClose.length * 20;
  score += transportPoints;
  breakdown.push({
    key: "transport",
    label: "Metro / tram erişimi",
    points: transportPoints,
    active: transportClose.length > 0,
    details: transportClose.length
      ? `${transportClose.length} adet seçenek bulundu: ${joinPlaceNames(transportClose)}`
      : "500 m içinde metro veya tram bağlantısı bulunamadı."
  });

  const hospitalPlaces = nearbyPlaces.filter((place) => place.kind === "hospital");
  const hospitalClose = hospitalPlaces.filter((place) => place.distanceMeters <= 1_000);
  const hospitalPoints = hospitalClose.length * 15;
  score += hospitalPoints;
  breakdown.push({
    key: "hospital",
    label: "Hastane erişimi",
    points: hospitalPoints,
    active: hospitalClose.length > 0,
    details: hospitalClose.length
      ? `${hospitalClose.length} adet hastane 1 km içinde: ${joinPlaceNames(hospitalClose)}`
      : "1 km içinde hastane bulunamadı."
  });

  const schoolPlaces = nearbyPlaces.filter((place) => place.kind === "school");
  const schoolClose = schoolPlaces.filter((place) => place.distanceMeters <= 500);
  const schoolPoints = schoolClose.length * 10;
  score += schoolPoints;
  breakdown.push({
    key: "school",
    label: "Okul yakınlığı",
    points: schoolPoints,
    active: schoolClose.length > 0,
    details: schoolClose.length
      ? `${schoolClose.length} adet okul 500 m içinde: ${joinPlaceNames(schoolClose)}`
      : "500 m içinde okul bulunamadı."
  });

  const parkPlaces = nearbyPlaces.filter((place) => place.kind === "park");
  const parkClose = parkPlaces.filter((place) => place.distanceMeters <= 300);
  const parkPoints = parkClose.length * 10;
  score += parkPoints;
  breakdown.push({
    key: "park",
    label: "Park erişimi",
    points: parkPoints,
    active: parkClose.length > 0,
    details: parkClose.length
      ? `${parkClose.length} adet park 300 m içinde: ${joinPlaceNames(parkClose)}`
      : "300 m içinde park bulunamadı."
  });

  const supermarketPlaces = nearbyPlaces.filter((place) => place.kind === "supermarket");
  const supermarketClose = supermarketPlaces.filter((place) => place.distanceMeters <= 300);
  const supermarketPoints = supermarketClose.length * 8;
  score += supermarketPoints;
  breakdown.push({
    key: "supermarket",
    label: "Market / süpermarket",
    points: supermarketPoints,
    active: supermarketClose.length > 0,
    details: supermarketClose.length
      ? `${supermarketClose.length} adet market 300 m içinde: ${joinPlaceNames(supermarketClose)}`
      : "300 m içinde market bulunamadı."
  });

  const pharmacyPlaces = nearbyPlaces.filter((place) => place.kind === "pharmacy");
  const pharmacyClose = pharmacyPlaces.filter((place) => place.distanceMeters <= 500);
  const pharmacyPoints = pharmacyClose.length * 5;
  score += pharmacyPoints;
  breakdown.push({
    key: "pharmacy",
    label: "Eczane yakınlığı",
    points: pharmacyPoints,
    active: pharmacyClose.length > 0,
    details: pharmacyClose.length
      ? `${pharmacyClose.length} adet eczane 500 m içinde: ${joinPlaceNames(pharmacyClose)}`
      : "500 m içinde eczane bulunamadı."
  });

  const restaurantCount = nearbyPlaces.filter(
    (place) => place.kind === "restaurant" && place.distanceMeters <= 1_000
  ).length;
  const restaurantPoints = restaurantCount > 3 ? 5 : 0;
  score += restaurantPoints;
  breakdown.push({
    key: "restaurant",
    label: "Restoran yoğunluğu",
    points: restaurantPoints,
    active: restaurantCount > 3,
    details:
      restaurantCount > 3
        ? `${restaurantCount} restoran bulundu, ekstra sosyal çevre puanı eklendi.`
        : "Ekstra puan için 1 km içinde en az 4 restoran gerekir."
  });

  const cappedScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: cappedScore,
    breakdown,
    label: buildLabel(cappedScore)
  };
}
