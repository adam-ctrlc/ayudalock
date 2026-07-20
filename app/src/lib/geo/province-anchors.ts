import { PH_PROVINCES } from "@/lib/geo/ph-provinces";
import { pointInRing } from "@/lib/geo/point-in-province";

export type Anchor = { x: number; y: number };

function ringArea(ring: number[]): number {
  let sum = 0;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    sum += ring[j] * ring[i + 1] - ring[i] * ring[j + 1];
  }
  return sum / 2;
}

function ringCentroid(ring: number[]): Anchor | null {
  let cx = 0;
  let cy = 0;
  let area = 0;

  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const cross = ring[j] * ring[i + 1] - ring[i] * ring[j + 1];
    area += cross;
    cx += (ring[j] + ring[i]) * cross;
    cy += (ring[j + 1] + ring[i + 1]) * cross;
  }

  if (area === 0) return null;

  return { x: cx / (3 * area), y: cy / (3 * area) };
}

function bboxCenter(bbox: [number, number, number, number]): Anchor {
  return { x: (bbox[0] + bbox[2]) / 2, y: (bbox[1] + bbox[3]) / 2 };
}

function interiorPointNear(
  ring: number[],
  bbox: [number, number, number, number],
  target: Anchor,
): Anchor {
  const [minX, minY, maxX, maxY] = bbox;
  const steps = 12;
  let best: Anchor | null = null;
  let bestDistance = Infinity;

  for (let ix = 1; ix < steps; ix += 1) {
    for (let iy = 1; iy < steps; iy += 1) {
      const x = minX + ((maxX - minX) * ix) / steps;
      const y = minY + ((maxY - minY) * iy) / steps;

      if (!pointInRing(x, y, ring)) continue;

      const distance = (x - target.x) ** 2 + (y - target.y) ** 2;

      if (distance < bestDistance) {
        bestDistance = distance;
        best = { x, y };
      }
    }
  }

  return best ?? bboxCenter(bbox);
}

function anchorFor(polys: number[][], bbox: [number, number, number, number]): Anchor {
  let largest: number[] | null = null;
  let largestArea = 0;

  for (const ring of polys) {
    const area = Math.abs(ringArea(ring));
    if (area > largestArea) {
      largestArea = area;
      largest = ring;
    }
  }

  if (largest === null) return bboxCenter(bbox);

  const centroid = ringCentroid(largest) ?? bboxCenter(bbox);

  return pointInRing(centroid.x, centroid.y, largest)
    ? centroid
    : interiorPointNear(largest, bbox, centroid);
}

export const PROVINCE_ANCHORS: Record<string, Anchor> = Object.fromEntries(
  PH_PROVINCES.map((province) => [
    province.code,
    anchorFor(province.polys, province.bbox),
  ]),
);
