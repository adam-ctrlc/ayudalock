import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";

import type { PriceCategory, PriceReference } from "@/lib/api/prices";
import { usePrices } from "@/lib/queries/prices";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CategoryIcon,
  TrendIndicator,
  trendColor,
} from "@/components/price-indicators";

const ORDER: PriceCategory[] = ["fuel", "fare", "commodity"];

function pickHighlights(data: PriceReference[]) {
  return ORDER.map((cat) => data.find((p) => p.category === cat)).filter(
    (p): p is PriceReference => Boolean(p),
  );
}

function ChangeBar({ price }: { price: PriceReference }) {
  const pct = price.change_percent;
  const width = pct === null ? 6 : Math.min(Math.max(Math.abs(pct) * 5, 6), 100);
  return (
    <View className="h-1.5 overflow-hidden rounded-full bg-muted">
      <View
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          backgroundColor: trendColor(price.trend, pct),
        }}
      />
    </View>
  );
}

export function MarketSnapshot() {
  const query = usePrices("all");
  const highlights = useMemo(
    () => pickHighlights(query.data ?? []),
    [query.data],
  );

  return (
    <>
      <View className="flex-row items-center justify-between">
        <Text variant="heading">Market snapshot</Text>
        <Link href="/(citizen)/prices" asChild>
          <Pressable hitSlop={8} className="active:opacity-60">
            <Text variant="caption" className="font-medium text-primary">
              See all
            </Text>
          </Pressable>
        </Link>
      </View>

      <Card className="gap-3.5">
        {query.isLoading ? (
          <View className="gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </View>
        ) : query.isError || highlights.length === 0 ? (
          <Text variant="caption">Prices are unavailable right now.</Text>
        ) : (
          highlights.map((price) => (
            <View key={price.id} className="gap-1.5">
              <View className="flex-row items-center gap-3">
                <CategoryIcon category={price.category} size={18} />
                <View className="flex-1">
                  <Text variant="label">{price.name}</Text>
                  <Text variant="caption">{price.unit}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-base font-bold">
                    ₱{price.value.toFixed(2)}
                  </Text>
                  <TrendIndicator
                    trend={price.trend}
                    changePercent={price.change_percent}
                  />
                </View>
              </View>
              <ChangeBar price={price} />
            </View>
          ))
        )}
      </Card>
    </>
  );
}
