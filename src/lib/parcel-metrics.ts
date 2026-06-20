import { area, bbox, centroid, distance } from "@turf/turf";
import type { Position } from "geojson";

import { parcelMetricsSchema, type ParcelCoordinatePoint, type ParcelFeatureCollection, type ParcelMetrics } from "@/types/parcel";

function round(value: number, fractionDigits = 2) {
  const multiplier = 10 ** fractionDigits;
  return Math.round(value * multiplier) / multiplier;
}

function readOuterRing(geojson: ParcelFeatureCollection): Position[] {
  const feature = geojson.features[0];

  if (!feature?.geometry || feature.geometry.type !== "Polygon") {
    throw new Error("Parsel geometrisi desteklenmeyen bir formatta.");
  }

  const ring = feature.geometry.coordinates[0] ?? [];

  if (ring.length < 4) {
    throw new Error("Parsel koordinatlari hesaplama icin yeterli degil.");
  }

  return ring;
}

function toCornerPoints(ring: Position[]): ParcelCoordinatePoint[] {
  const points = ring.slice(0, -1);

  return points.map((position, index) => ({
    pointNo: index + 1,
    lat: round(Number(position[1]), 6),
    lng: round(Number(position[0]), 6)
  }));
}

function calculateApproximateFrontage(points: ParcelCoordinatePoint[]) {
  if (points.length < 2) {
    return 0;
  }

  let longestSegment = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const segmentLength =
      distance([current.lng, current.lat], [next.lng, next.lat], { units: "kilometers" }) * 1000;

    if (segmentLength > longestSegment) {
      longestSegment = segmentLength;
    }
  }

  return round(longestSegment);
}

export function calculateParcelMetrics(geojson: ParcelFeatureCollection): ParcelMetrics {
  const feature = geojson.features[0];

  if (!feature?.geometry) {
    throw new Error("Parsel geometrisi bulunamadi.");
  }

  const areaM2 = area(feature);
  const [west, south, east, north] = bbox(feature);
  const center = centroid(feature);
  const ring = readOuterRing(geojson);
  const cornerPoints = toCornerPoints(ring);
  let perimeterM = 0;

  for (let index = 0; index < cornerPoints.length; index += 1) {
    const current = cornerPoints[index];
    const next = cornerPoints[(index + 1) % cornerPoints.length];
    perimeterM += distance([current.lng, current.lat], [next.lng, next.lat], {
      units: "kilometers"
    }) * 1000;
  }

  return parcelMetricsSchema.parse({
    areaM2: round(areaM2),
    areaDonum: round(areaM2 / 1000, 3),
    perimeterM: round(perimeterM),
    centroidLat: round(Number(center.geometry.coordinates[1]), 6),
    centroidLng: round(Number(center.geometry.coordinates[0]), 6),
    bbox: {
      west: round(west, 6),
      south: round(south, 6),
      east: round(east, 6),
      north: round(north, 6)
    },
    cornerPoints,
    geometryType: feature.geometry.type,
    approximateFrontageM: calculateApproximateFrontage(cornerPoints)
  });
}
