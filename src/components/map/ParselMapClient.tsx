"use client";

import L from "leaflet";
import type { Feature, FeatureCollection, GeoJsonObject } from "geojson";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { GeoJSON as LeafletGeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import type { ParselMapProps } from "@/components/map/ParselMap";

const DEFAULT_CENTER: [number, number] = [39.0, 35.0];

function readProperty(feature: Feature, ...keys: string[]) {
  const properties = feature.properties as Record<string, unknown> | undefined;
  if (!properties) {
    return undefined;
  }

  for (const key of keys) {
    const value = properties[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function createParcelIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:18px;
        height:18px;
        border-radius:9999px;
        background:#1E3A8A;
        border:3px solid #ffffff;
        box-shadow:0 0 0 8px rgba(59,130,246,0.18);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function MapViewport({
  geojsonData,
  latitude,
  longitude,
  geoJsonRef
}: {
  geojsonData?: FeatureCollection;
  latitude?: number;
  longitude?: number;
  geoJsonRef: RefObject<L.GeoJSON | null>;
}) {
  const map = useMap();

  useEffect(() => {
    if (typeof latitude === "number" && typeof longitude === "number") {
      map.flyTo([latitude, longitude], 13);
      return;
    }

    if (geojsonData && geoJsonRef.current) {
      const bounds = geoJsonRef.current.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.15));
      }
    }
  }, [geoJsonRef, geojsonData, latitude, longitude, map]);

  return null;
}

function ParselMapClient({ geojsonData, latitude, longitude, onParselSelect }: ParselMapProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const parcelIcon = useMemo(() => createParcelIcon(), []);

  useEffect(() => {
    setSelectedFeature(null);
  }, [geojsonData]);

  const layerStyle = useCallback(
    (feature: Feature | undefined) => {
      const isSelected = Boolean(feature && selectedFeature && feature === selectedFeature);

      return {
        fillColor: isSelected ? "#F59E0B" : "#3B82F6",
        fillOpacity: isSelected ? 0.45 : 0.3,
        color: isSelected ? "#B45309" : "#1E3A8A",
        weight: isSelected ? 3 : 2,
        opacity: 1
      };
    },
    [selectedFeature]
  );

  const center: [number, number] =
    typeof latitude === "number" && typeof longitude === "number" ? [latitude, longitude] : DEFAULT_CENTER;

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
      <MapContainer
        center={center}
        zoom={typeof latitude === "number" && typeof longitude === "number" ? 16 : 6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıda bulunanlar'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewport geojsonData={geojsonData} latitude={latitude} longitude={longitude} geoJsonRef={geoJsonRef} />

        {geojsonData ? (
          <LeafletGeoJSON
            ref={geoJsonRef}
            data={geojsonData as GeoJsonObject}
            style={layerStyle}
            onEachFeature={(feature, layer) => {
              const adaNo = readProperty(feature, "Ada", "ada", "AdaNo");
              const parselNo = readProperty(feature, "ParselNo", "Parsel", "parsel", "PARSEL");
              const il = readProperty(feature, "Il", "il", "İl");
              const ilce = readProperty(feature, "Ilce", "ilce", "İlce");

              layer.on("click", () => {
                setSelectedFeature(feature);
                onParselSelect?.(feature);
              });

              layer.bindPopup(
                `
                  <div style="font-family:Inter,system-ui,sans-serif">
                    <strong>Ada:</strong> ${adaNo ?? "-"}<br />
                    <strong>Parsel:</strong> ${parselNo ?? "-"}<br />
                    <strong>İl:</strong> ${il ?? "-"}<br />
                    <strong>İlçe:</strong> ${ilce ?? "-"}
                  </div>
                `
              );
            }}
          />
        ) : null}

        {typeof latitude === "number" && typeof longitude === "number" ? (
          <Marker position={[latitude, longitude]} icon={parcelIcon}>
            <Popup>Seçilen konum</Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}

export default ParselMapClient;
