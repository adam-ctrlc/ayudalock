export const HAZARD_LABEL: Record<string, string> = {
  earthquake: "Earthquake",
  typhoon: "Typhoon",
  flood: "Flood",
  fire: "Fire",
  other: "Hazard",
};

export function hazardLabel(type: string): string {
  return HAZARD_LABEL[type] ?? "Hazard";
}

export function hazardWhen(iso: string | null): string {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
