"use client";

import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { GeoJSON as LeafletGeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import type { ParcelFeatureCollection } from "@/types/parcel";

const DEFAULT_CENTER: [number, number] = [39.0, 35.0];

function createCentroidIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:18px;
        height:18px;
        border-radius:9999px;
        background:#dc2626;
        border:3px solid #ffffff;
        box-shadow:0 0 0 8px rgba(220,38,38,0.18);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function FitToParcel({
  geoJsonRef
}: {
  geoJsonRef: RefObject<L.GeoJSON | null>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!geoJsonRef.current) {
      return;
    }

    const bounds = geoJsonRef.current.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.15));
    }
  }, [geoJsonRef, map]);

  return null;
}

export function ParcelMapClient({
  geojson,
  centroidLat,
  centroidLng
}: {
  geojson: ParcelFeatureCollection;
  centroidLat: number;
  centroidLng: number;
}) {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const centroidIcon = useMemo(() => createCentroidIcon(), []);

  if (!geojson.features.length) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Harita icin gecerli bir parsel geometrisi bulunamadi.
      </div>
    );
  }

  return (
    <div className="h-[420px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100">
      <MapContainer center={DEFAULT_CENTER} zoom={6} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LeafletGeoJSON
          ref={geoJsonRef}
          data={geojson as GeoJsonObject}
          style={{
            color: "#dc2626",
            weight: 3,
            opacity: 1,
            fillColor: "#ef4444",
            fillOpacity: 0.18
          }}
        />

        <Marker position={[centroidLat, centroidLng]} icon={centroidIcon}>
          <Popup>
            Merkez koordinat
            <br />
            {centroidLat.toFixed(6)}, {centroidLng.toFixed(6)}
          </Popup>
        </Marker>

        <FitToParcel geoJsonRef={geoJsonRef} />
      </MapContainer>
    </div>
  );
}
