import { View } from "react-native";
import {
  Bus,
  GasPump,
  Minus,
  ShoppingCart,
  TrendDown,
  TrendUp,
} from "phosphor-react-native";

import type { PriceCategory, PriceTrend } from "@/lib/api/prices";
import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";

export function CategoryIcon({
  category,
  size = 20,
}: {
  category: PriceCategory;
  size?: number;
}) {
  switch (category) {
    case "fuel":
      return <GasPump size={size} color={PH_COLORS.red} weight="duotone" />;
    case "fare":
      return <Bus size={size} color={PH_COLORS.blue} weight="duotone" />;
    default:
      return (
        <ShoppingCart size={size} color={PH_COLORS.success} weight="duotone" />
      );
  }
}

export function trendColor(trend: PriceTrend, changePercent: number | null) {
  if (changePercent === null) return PH_COLORS.mutedForeground;
  return trend === "up" ? PH_COLORS.red : PH_COLORS.success;
}

export function TrendIndicator({
  trend,
  changePercent,
}: {
  trend: PriceTrend;
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
  const color = trendColor(trend, changePercent);
  const Icon = trend === "up" ? TrendUp : TrendDown;
  return (
    <View className="flex-row items-center gap-1">
      <Icon size={16} color={color} weight="bold" />
      <Text className="text-sm font-semibold" style={{ color }}>
        {Math.abs(changePercent).toFixed(1)}%
      </Text>
    </View>
  );
}
