"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

import { getMapboxToken } from "@/lib/mapbox";

export function PropertyMap({
  coordinates,
  title
}: {
  coordinates?: [number, number];
  title: string;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const token = getMapboxToken();

  useEffect(() => {
    if (!mapRef.current || !coordinates || !token) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: coordinates,
      zoom: 13,
      pitch: 55,
      bearing: -20,
      antialias: true
    });

    map.on("style.load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15
        }
      });
      new mapboxgl.Marker({ color: "#10b981" }).setLngLat(coordinates).setPopup(new mapboxgl.Popup().setText(title)).addTo(map);
    });

    return () => map.remove();
  }, [coordinates, title, token]);

  if (!coordinates) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[2rem] border border-dashed text-sm text-muted-foreground">
        Harita konumu bulunamadı.
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[2rem] border border-dashed text-sm text-muted-foreground">
        Harita için `NEXT_PUBLIC_MAPBOX_TOKEN` tanımlayın.
      </div>
    );
  }

  return <div ref={mapRef} className="aspect-video overflow-hidden rounded-[2rem] border" />;
}
