import { apiRequest } from "@/lib/api/client";

export type HazardEventBrief = {
  id: number;
  type: string;
  title: string;
  magnitude: number | null;
  severity: number;
  affected_people: number | null;
  occurred_at: string | null;
};

export type ProvinceImpact = {
  code: string;
  name: string;
  affected_people: number;
  severity: number;
  event_count: number;
  top_event: HazardEventBrief | null;
};

export type ProvinceDetail = {
  code: string;
  name: string;
  affected_people: number;
  severity: number;
  event_count: number;
  events: HazardEventBrief[];
};

export async function listProvinceImpacts(
  windowDays = 30,
  signal?: AbortSignal,
) {
  const res = await apiRequest<{ data: ProvinceImpact[] }>("/heatmap/provinces", {
    query: { window: windowDays },
    auth: false,
    signal,
  });
  return res.data;
}

export async function getProvinceDetail(code: string, signal?: AbortSignal) {
  const res = await apiRequest<{ data: ProvinceDetail }>(
    `/heatmap/provinces/${code}`,
    { auth: false, signal },
  );
  return res.data;
}
