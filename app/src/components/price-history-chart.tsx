import { View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";

import { usePriceHistory } from "@/lib/queries/prices";
import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";

const WIDTH = 320;
const HEIGHT = 120;
const PAD = 10;

export function PriceHistoryChart({ id }: { id: number }) {
  const history = usePriceHistory(id);

  if (history.isLoading) {
    return <Skeleton className="h-32 w-full rounded-2xl" />;
  }

  const rows = history.data ?? [];
  const series = [...rows].reverse().map((r) => r.value);

  if (series.length < 2) {
    return (
      <Text variant="caption">Not enough history yet to draw a trend.</Text>
    );
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = (WIDTH - PAD * 2) / (series.length - 1);

  const coords = series.map((value, index) => {
    const x = PAD + index * stepX;
    const y = PAD + (HEIGHT - PAD * 2) * (1 - (value - min) / range);
    return { x, y };
  });

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const last = coords[coords.length - 1];

  return (
    <View className="gap-1">
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Polyline
          points={polyline}
          fill="none"
          stroke={PH_COLORS.blue}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle cx={last.x} cy={last.y} r={4} fill={PH_COLORS.blue} />
      </Svg>
      <View className="flex-row justify-between">
        <Text variant="caption">Low ₱{min.toFixed(2)}</Text>
        <Text variant="caption">High ₱{max.toFixed(2)}</Text>
      </View>
    </View>
  );
}
