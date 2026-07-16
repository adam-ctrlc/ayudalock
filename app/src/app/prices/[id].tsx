import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { usePrices } from "@/lib/queries/prices";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BackBar } from "@/components/back-bar";
import { CategoryIcon, TrendIndicator } from "@/components/price-indicators";
import { PriceHistoryChart } from "@/components/price-history-chart";

export default function PriceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numId = Number(id);
  const prices = usePrices("all");
  const price = prices.data?.find((p) => p.id === numId);

  return (
    <Screen edges={["top"]}>
      <BackBar label="Price Watch" />

      {price ? (
        <View className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
              <CategoryIcon category={price.category} size={22} />
            </View>
            <View className="flex-1">
              <Text variant="title">{price.name}</Text>
              <Text variant="caption">
                {price.region} · {price.unit}
              </Text>
            </View>
          </View>

          <Card className="gap-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text variant="caption">Current price</Text>
                <Text className="text-3xl font-bold">
                  ₱{price.value.toFixed(2)}
                </Text>
              </View>
              <TrendIndicator
                trend={price.trend}
                changePercent={price.change_percent}
              />
            </View>
            {price.previous_value != null ? (
              <Text variant="caption">
                Previous ₱{price.previous_value.toFixed(2)}
                {price.effective_date ? ` · as of ${price.effective_date}` : ""}
              </Text>
            ) : null}
          </Card>

          <Text variant="heading">Price trend</Text>
          <Card>
            <PriceHistoryChart id={numId} />
          </Card>

          {price.source ? (
            <Text variant="caption">Source: {price.source}</Text>
          ) : null}
        </View>
      ) : prices.isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-5 w-28 rounded-lg" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </View>
      ) : (
        <Text variant="caption">Price not found.</Text>
      )}
    </Screen>
  );
}
