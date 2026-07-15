export type HeatMetric = "affected" | "severity" | "rainfall";

export const NO_DATA_COLOR = "#e5e9f0";

export const HEAT_COLORS = [
  "#fde68a",
  "#fbbf24",
  "#fb923c",
  "#f97316",
  "#dc2626",
] as const;

export function colorForRatio(ratio: number): string {
  if (ratio <= 0) return NO_DATA_COLOR;
  if (ratio < 0.2) return HEAT_COLORS[0];
  if (ratio < 0.4) return HEAT_COLORS[1];
  if (ratio < 0.6) return HEAT_COLORS[2];
  if (ratio < 0.8) return HEAT_COLORS[3];
  return HEAT_COLORS[4];
}
