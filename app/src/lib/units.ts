const UNIT_LABELS: Record<string, string> = {
  kg: "kilograms (kg)",
  kilogram: "kilograms (kg)",
  kilograms: "kilograms (kg)",
  liter: "liters (L)",
  liters: "liters (L)",
  litre: "liters (L)",
  l: "liters (L)",
  pack: "packs (pack)",
  can: "cans (can)",
};

export function unitLabel(unit: string | null | undefined) {
  const key = (unit ?? "").trim().toLowerCase();
  if (!key) return "";
  return UNIT_LABELS[key] ?? unit ?? "";
}
