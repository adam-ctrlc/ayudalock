import { PH_PROVINCES, type ProvincePath } from "@/lib/geo/ph-provinces";

function pointInRing(x: number, y: number, ring: number[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const xi = ring[i];
    const yi = ring[i + 1];
    const xj = ring[j];
    const yj = ring[j + 1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Which province contains an (x, y) point in SVG viewBox space. Bbox-rejects
 * first, then ray-casts against the polygon rings; on overlap the smallest
 * province wins so tiny provinces are still reachable.
 */
export function provinceAt(x: number, y: number): ProvincePath | null {
  let best: ProvincePath | null = null;
  let bestArea = Infinity;
  for (const province of PH_PROVINCES) {
    const [minX, minY, maxX, maxY] = province.bbox;
    if (x < minX || x > maxX || y < minY || y > maxY) continue;
    if (province.polys.some((ring) => pointInRing(x, y, ring))) {
      const area = (maxX - minX) * (maxY - minY);
      if (area < bestArea) {
        bestArea = area;
        best = province;
      }
    }
  }
  return best;
}
