import { useRef } from "react";
import { Pressable, View } from "react-native";
import { CornersOut, Minus, Plus } from "phosphor-react-native";
import Svg, { Path } from "react-native-svg";

import { PH_PROVINCES, PH_VIEWBOX } from "@/lib/geo/ph-provinces";
import { provinceAt } from "@/lib/geo/point-in-province";
import { usePanZoom } from "@/lib/use-pan-zoom";
import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import {
  HEAT_COLORS,
  NO_DATA_COLOR,
  colorForRatio,
} from "@/components/heatmap/severity-scale";

function ControlButton({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-9 w-9 items-center justify-center rounded-lg border border-border bg-card active:opacity-70"
    >
      {children}
    </Pressable>
  );
}

export function PhilippinesHeatmap({
  values,
  maxValue,
  selectedCode,
  onSelect,
  onInteractionChange,
}: {
  values: Record<string, number>;
  maxValue: number;
  selectedCode?: string | null;
  onSelect?: (code: string) => void;
  onInteractionChange?: (active: boolean) => void;
}) {
  const mapRef = useRef<ReturnType<typeof usePanZoom> | null>(null);
  const map = usePanZoom({
    width: PH_VIEWBOX.width,
    height: PH_VIEWBOX.height,
    onInteractionChange,
    onTap: (x, y) => {
      const province = provinceAt(x, y);
      if (!province) return;
      mapRef.current?.zoomToBBox(province.bbox);
      onSelect?.(province.code);
    },
  });
  mapRef.current = map;

  return (
    <View
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-card"
      style={{ aspectRatio: map.aspect }}
    >
      <View className="absolute inset-0" onLayout={map.onLayout} {...map.panHandlers}>
        <Svg width="100%" height="100%" viewBox={map.viewBox}>
          {PH_PROVINCES.map((province) => {
            const value = values[province.code] ?? 0;
            const ratio = maxValue > 0 ? value / maxValue : 0;
            const selected = province.code === selectedCode;
            return (
              <Path
                key={province.code}
                d={province.d}
                fill={colorForRatio(ratio)}
                stroke={selected ? PH_COLORS.blue : "#ffffff"}
                strokeWidth={selected ? 1.6 : 0.4}
              />
            );
          })}
        </Svg>
      </View>

      <View className="absolute inset-0" pointerEvents="box-none">
        <View className="absolute left-2 top-2 gap-1 rounded-lg border border-border bg-card px-2 py-1.5">
          <Text className="text-[10px] font-semibold text-muted-foreground">
            Impact
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-[9px] text-muted-foreground">Low</Text>
            <View className="flex-row overflow-hidden rounded-full">
              <View
                className="h-2 w-3"
                style={{ backgroundColor: NO_DATA_COLOR }}
              />
              {HEAT_COLORS.map((color) => (
                <View
                  key={color}
                  className="h-2 w-3"
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
            <Text className="text-[9px] text-muted-foreground">High</Text>
          </View>
        </View>

        <View className="absolute bottom-2 right-2 gap-1.5">
          <ControlButton onPress={map.zoomIn}>
            <Plus size={18} color={PH_COLORS.foreground} />
          </ControlButton>
          <ControlButton onPress={map.zoomOut}>
            <Minus size={18} color={PH_COLORS.foreground} />
          </ControlButton>
          <ControlButton onPress={map.reset}>
            <CornersOut size={16} color={PH_COLORS.foreground} />
          </ControlButton>
        </View>
      </View>
    </View>
  );
}
