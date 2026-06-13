declare module "togeojson" {
  export function kml(document: Document): GeoJSON.FeatureCollection;
  export function gpx(document: Document): GeoJSON.FeatureCollection;
  export function tcx(document: Document): GeoJSON.FeatureCollection;

  const toGeoJSON: {
    kml: typeof kml;
    gpx: typeof gpx;
    tcx: typeof tcx;
  };

  export default toGeoJSON;
}
