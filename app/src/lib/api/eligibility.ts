import { apiRequest } from "@/lib/api/client";

export type ProgramType = "food" | "fuel";

export type Commodity = {
  id: number;
  name: string;
  unit: string;
  program_id: number;
};

export type Program = {
  id: number;
  name: string;
  type: ProgramType;
  unit: string;
  per_beneficiary_cap: number;
  commodities?: Commodity[];
};

export type EligibilityResult = {
  eligible: boolean;
  eligible_types: string[];
  programs: Program[];
};

export function verifyEligibility(signal?: AbortSignal) {
  return apiRequest<EligibilityResult>("/eligibility/verify", {
    method: "POST",
    signal,
  });
}
