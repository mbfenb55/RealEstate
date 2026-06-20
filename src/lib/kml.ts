import { area, featureCollection } from "@turf/turf";
import type { Feature, Polygon, Position } from "geojson";
import toGeoJSON from "togeojson";
import { DOMParser } from "xmldom";

import { parcelMetadataSchema, type ParcelFeatureCollection, type ParcelMetadata } from "@/types/parcel";

const KML_MIME_TYPES = new Set([
  "application/vnd.google-earth.kml+xml",
  "application/octet-stream",
  "application/xml",
  "text/xml",
  "text/plain",
  ""
]);

function isFinitePosition(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  );
}

function normalizePosition(value: Position): Position {
  return [Number(value[0]), Number(value[1])];
}

function normalizeRing(value: unknown): Position[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const positions = value.filter(isFinitePosition).map(normalizePosition);

  if (positions.length < 3) {
    return [];
  }

  const first = positions[0];
  const last = positions[positions.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    positions.push([first[0], first[1]]);
  }

  return positions;
}

function normalizePolygonCoordinates(value: unknown): Position[][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((ring) => normalizeRing(ring))
    .filter((ring) => ring.length >= 4);
}

function collectPolygonCandidates(geojson: ParcelFeatureCollection): Feature<Polygon>[] {
  const polygons: Feature<Polygon>[] = [];

  for (const feature of geojson.features) {
    const geometry = feature.geometry;

    if (!geometry) {
      continue;
    }

    if (geometry.type === "Polygon") {
      const coordinates = normalizePolygonCoordinates(geometry.coordinates);
      if (coordinates.length) {
        polygons.push({
          type: "Feature",
          properties: feature.properties ?? {},
          geometry: {
            type: "Polygon",
            coordinates
          }
        });
      }
      continue;
    }

    if (geometry.type === "MultiPolygon") {
      for (const polygonCoordinates of geometry.coordinates) {
        const coordinates = normalizePolygonCoordinates(polygonCoordinates);
        if (coordinates.length) {
          polygons.push({
            type: "Feature",
            properties: feature.properties ?? {},
            geometry: {
              type: "Polygon",
              coordinates
            }
          });
        }
      }
    }
  }

  return polygons.sort((left, right) => area(right) - area(left));
}

function normalizeTextValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function readProperty(properties: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = normalizeTextValue(properties[key]);
    if (value) {
      return value;
    }
  }

  return null;
}

function extractMetadata(feature: Feature<Polygon>): ParcelMetadata {
  const properties =
    feature.properties && typeof feature.properties === "object"
      ? (feature.properties as Record<string, unknown>)
      : {};

  return parcelMetadataSchema.parse({
    adaNo: readProperty(properties, "Ada", "ada", "AdaNo", "ADA_NO", "ada_no"),
    parselNo: readProperty(properties, "ParselNo", "Parsel", "parsel", "PARSEL", "parsel_no"),
    il: readProperty(properties, "Il", "il", "IL", "city", "City"),
    ilce: readProperty(properties, "Ilce", "ilce", "ILCE", "district", "District")
  });
}

function parseXmlDocument(kmlText: string) {
  const parseErrors: string[] = [];
  const document = new DOMParser({
    errorHandler: {
      warning: () => undefined,
      error: (message) => {
        parseErrors.push(message);
      },
      fatalError: (message) => {
        parseErrors.push(message);
      }
    }
  }).parseFromString(kmlText, "application/xml");

  if (parseErrors.length) {
    throw new Error("KML dosyasi okunamadi. Lutfen gecerli bir KML dosyasi yukleyin.");
  }

  return document;
}

export function isSupportedKmlUpload(fileName: string, mimeType?: string) {
  return fileName.toLowerCase().endsWith(".kml") && KML_MIME_TYPES.has(mimeType?.toLowerCase() ?? "");
}

export function convertKmlTextToGeoJson(kmlText: string) {
  const xmlDocument = parseXmlDocument(kmlText);
  const rawGeoJson = toGeoJSON.kml(xmlDocument) as ParcelFeatureCollection;
  const polygonFeature = collectPolygonCandidates(rawGeoJson)[0];

  if (!polygonFeature) {
    throw new Error("KML icinde cizilebilir bir parsel poligonu bulunamadi.");
  }

  return {
    geojson: featureCollection([polygonFeature]) as ParcelFeatureCollection,
    metadata: extractMetadata(polygonFeature)
  };
}
