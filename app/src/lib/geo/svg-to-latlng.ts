import { PH_VIEWBOX } from "@/lib/geo/ph-provinces";

export type LatLng = { latitude: number; longitude: number };

const { width, height, geo } = PH_VIEWBOX;

/**
 * The source SVG is a linear stretch of the archipelago's bounding box, not a
 * true cartographic projection. Measured against the 81 seeded province
 * reference points the systematic bias is about a kilometre, but the spread is
 * several kilometres. That is fine for a rough pin and far too coarse to decide
 * which province a point sits in, so callers that need a province must use
 * provinceAt() on the SVG coordinates instead of round-tripping through here.
 */
export function svgToLatLng(x: number, y: number): LatLng {
  return {
    longitude: geo.west + (x / width) * (geo.east - geo.west),
    latitude: geo.north - (y / height) * (geo.north - geo.south),
  };
}

export function latLngToSvg(latitude: number, longitude: number) {
  return {
    x: ((longitude - geo.west) / (geo.east - geo.west)) * width,
    y: ((geo.north - latitude) / (geo.north - geo.south)) * height,
  };
}

export function isInsidePhilippines(latitude: number, longitude: number): boolean {
  return (
    latitude <= geo.north &&
    latitude >= geo.south &&
    longitude >= geo.west &&
    longitude <= geo.east
  );
}
