import { View } from "react-native";

import { useHazards } from "@/lib/queries/hazards";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { colorForRatio } from "@/components/heatmap/severity-scale";
import { hazardLabel, hazardWhen } from "@/components/heatmap/hazard-labels";

export function HazardList({ limit = 8 }: { limit?: number }) {
  const hazards = useHazards();

  if (hazards.isLoading) {
    return (
      <View className="gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </View>
    );
  }

  const items = (hazards.data ?? []).slice(0, limit);

  if (items.length === 0) {
    return (
      <Card>
        <Text variant="caption">No hazards reported right now.</Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      {items.map((hazard) => (
        <Card key={hazard.id} className="flex-row items-start gap-3">
          <View
            className="mt-1 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: colorForRatio(hazard.severity / 100) }}
          />
          <View className="flex-1 gap-0.5">
            <Text variant="label">
              {hazardLabel(hazard.type)}
              {hazard.magnitude != null ? ` M${hazard.magnitude}` : ""}
              {" · "}
              {hazard.title}
            </Text>
            <Text variant="caption">
              {hazard.place ? `${hazard.place} · ` : ""}
              {hazard.affected_people != null
                ? `${hazard.affected_people.toLocaleString()} affected · `
                : ""}
              {hazardWhen(hazard.occurred_at)}
            </Text>
          </View>
        </Card>
      ))}
    </View>
  );
}
