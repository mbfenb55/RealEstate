import dynamic from "next/dynamic";

import type { ParcelFeatureCollection } from "@/types/parcel";

const ParcelMapClient = dynamic(() => import("./ParcelMapClient").then((module) => module.ParcelMapClient), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-[2rem] bg-slate-100" />
});

export function ParcelMap({
  geojson,
  centroidLat,
  centroidLng
}: {
  geojson: ParcelFeatureCollection;
  centroidLat: number;
  centroidLng: number;
}) {
  return <ParcelMapClient geojson={geojson} centroidLat={centroidLat} centroidLng={centroidLng} />;
}
