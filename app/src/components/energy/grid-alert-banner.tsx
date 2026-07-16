import { View } from "react-native";

import { useGridStatus } from "@/lib/queries/energy";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { gridLevelVariant } from "@/components/energy/energy-labels";

export function GridAlertBanner({ province }: { province?: string }) {
  const grid = useGridStatus(province);

  const alerts = (grid.data ?? []).filter((g) => g.is_alert);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <View className="gap-2">
      {alerts.map((status) => (
        <Card key={status.id} className="gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <Text variant="label">{status.island_label}</Text>
            <Badge variant={gridLevelVariant(status.level)} label={status.level_label} />
          </View>
          {status.note ? <Text variant="caption">{status.note}</Text> : null}
          {status.reserve_mw !== null ? (
            <Text variant="caption">
              Operating reserve {status.reserve_mw} MW of {status.capacity_mw} MW capacity.
            </Text>
          ) : null}
        </Card>
      ))}
    </View>
  );
}
