import dynamic from "next/dynamic";

import type { Feature, FeatureCollection } from "geojson";

export type ParselMapProps = {
  geojsonData?: FeatureCollection;
  latitude?: number;
  longitude?: number;
  onParselSelect?: (feature: Feature) => void;
};

const ParselMap = dynamic<ParselMapProps>(() => import("./ParselMapClient"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse rounded-[1.5rem] bg-slate-100" />
});

export default ParselMap;
