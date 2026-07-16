import type { PowerStatus } from "@/lib/api/energy";
import { Badge } from "@/components/ui/badge";
import { powerStatusLabel, powerStatusVariant } from "@/components/energy/energy-labels";

export function PowerStatusBadge({ status }: { status: PowerStatus | null }) {
  if (status === null || status === "online") {
    return null;
  }

  return <Badge variant={powerStatusVariant(status)} label={powerStatusLabel(status)} />;
}
