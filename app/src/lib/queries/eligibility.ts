import { useQuery } from "@tanstack/react-query";

import { verifyEligibility } from "@/lib/api/eligibility";
import { qk } from "@/lib/queries/keys";

export function useEligibility() {
  return useQuery({ queryKey: qk.eligibility, queryFn: verifyEligibility });
}
