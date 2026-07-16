import { Pressable, View } from "react-native";

import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import type { HeatMetric } from "@/components/heatmap/severity-scale";

const OPTIONS: { key: HeatMetric; label: string }[] = [
  { key: "affected", label: "Affected" },
  { key: "severity", label: "Severity" },
  { key: "rainfall", label: "Rainfall" },
  { key: "outage", label: "Outages" },
];

export function MetricToggle({
  value,
  onChange,
}: {
  value: HeatMetric;
  onChange: (metric: HeatMetric) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {OPTIONS.map((option) => {
        const active = value === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            className={cn(
              "flex-1 items-center rounded-xl border py-2.5",
              active ? "border-primary bg-primary" : "border-border bg-background",
            )}
          >
            <Text
              numberOfLines={1}
              className={cn(
                "text-sm font-semibold",
                active ? "text-primary-foreground" : "text-foreground",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
