import { apiRequest } from "@/lib/api/client";
import type { Program } from "@/lib/api/eligibility";

export async function listPrograms(signal?: AbortSignal) {
  const res = await apiRequest<{ data: Program[] }>("/programs", { signal });
  return res.data;
}

export async function updateProgram(
  id: number,
  body: { per_beneficiary_cap?: number; name?: string; is_active?: boolean },
) {
  const res = await apiRequest<{ data: Program }>(`/programs/${id}`, {
    method: "PUT",
    body,
  });
  return res.data;
}
