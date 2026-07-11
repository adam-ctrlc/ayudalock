import { useState } from "react";
import { Pressable, View } from "react-native";
import { TrendDown, TrendUp, Minus } from "phosphor-react-native";

import type { PriceCategory } from "@/lib/api/prices";
import { usePrices } from "@/lib/queries/prices";
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { key: PriceCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "fuel", label: "Fuel" },
  { key: "fare", label: "Fare" },
  { key: "commodity", label: "Market" },
];

function Trend({
  trend,
  changePercent,
}: {
  trend: "up" | "down" | "steady";
  changePercent: number | null;
}) {
  if (changePercent === null) {
    return (
      <View className="flex-row items-center gap-1">
        <Minus size={16} color={PH_COLORS.mutedForeground} weight="bold" />
        <Text variant="caption">stable</Text>
      </View>
    );
  }
  const isUp = trend === "up";
  const color = isUp ? PH_COLORS.red : PH_COLORS.success;
  const Icon = isUp ? TrendUp : TrendDown;
  return (
    <View className="flex-row items-center gap-1">
      <Icon size={16} color={color} weight="bold" />
      <Text className="text-sm font-semibold" style={{ color }}>
        {Math.abs(changePercent).toFixed(1)}%
      </Text>
    </View>
  );
}

export function PriceList() {
  const [category, setCategory] = useState<PriceCategory | "all">("all");
  const query = usePrices(category);

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCategory(c.key)}
              className={cn(
                "rounded-full px-3 py-1.5",
                active ? "bg-primary" : "bg-muted",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  active ? "text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {query.isLoading ? (
        <View className="gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
          ))}
        </View>
      ) : query.isError ? (
        <Text className="text-destructive">Couldn&apos;t load prices.</Text>
      ) : (
        <View className="gap-3">
          {query.data?.map((price) => (
            <Card
              key={price.id}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 gap-0.5 pr-3">
                <Text variant="label">{price.name}</Text>
                <Text variant="caption">
                  {price.region} · {price.unit}
                </Text>
              </View>
              <View className="items-end gap-1">
                <Text className="text-lg font-bold">
                  ₱{price.value.toFixed(2)}
                </Text>
                <Trend
                  trend={price.trend}
                  changePercent={price.change_percent}
                />
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}
