import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { HEAT_COLORS, NO_DATA_COLOR } from "@/components/heatmap/severity-scale";

export function HeatmapLegend() {
  return (
    <View className="flex-row items-center gap-2">
      <Text variant="caption">Low</Text>
      <View className="flex-row overflow-hidden rounded-full">
        <View className="h-3 w-6" style={{ backgroundColor: NO_DATA_COLOR }} />
        {HEAT_COLORS.map((color) => (
          <View key={color} className="h-3 w-6" style={{ backgroundColor: color }} />
        ))}
      </View>
      <Text variant="caption">High</Text>
    </View>
  );
}
