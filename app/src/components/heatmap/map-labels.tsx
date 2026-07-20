import { useMemo } from "react";
import { View } from "react-native";

import { PH_PROVINCES, PH_VIEWBOX } from "@/lib/geo/ph-provinces";
import { PROVINCE_ANCHORS } from "@/lib/geo/province-anchors";
import type { ViewBox } from "@/lib/use-pan-zoom";
import { Text } from "@/components/ui/text";
import { colorForRatio } from "@/components/heatmap/severity-scale";

export type MapLabel = { title: string; value: string };

type Placed = {
  code: string;
  title: string;
  value: string;
  color: string;
  anchorX: number;
  anchorY: number;
  left: number;
  top: number;
  width: number;
};

const LABEL_HEIGHT = 34;
const CHAR_WIDTH = 6.2;
const PADDING = 22;
const TAIL = 12;
const MARGIN = 4;

function limitForScale(scale: number): number {
  switch (true) {
    case scale < 1.5:
      return 5;
    case scale < 3:
      return 8;
    default:
      return 12;
  }
}

function estimateWidth(title: string, value: string): number {
  const longest = Math.max(title.length, value.length);
  return Math.min(150, Math.max(64, longest * CHAR_WIDTH + PADDING));
}

function overlaps(a: Placed, b: Placed): boolean {
  return (
    a.left < b.left + b.width + MARGIN &&
    a.left + a.width + MARGIN > b.left &&
    a.top < b.top + LABEL_HEIGHT + MARGIN &&
    a.top + LABEL_HEIGHT + MARGIN > b.top
  );
}

export function MapLabels({
  values,
  maxValue,
  box,
  width,
  height,
  labelFor,
}: {
  values: Record<string, number>;
  maxValue: number;
  box: ViewBox;
  width: number;
  height: number;
  labelFor: (code: string, value: number) => MapLabel | null;
}) {
  const placed = useMemo<Placed[]>(() => {
    if (width <= 0 || height <= 0) return [];

    const scale = PH_VIEWBOX.width / box.w;
    const limit = limitForScale(scale);

    const candidates = PH_PROVINCES.map((province) => ({
      province,
      value: values[province.code] ?? 0,
    }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);

    const result: Placed[] = [];

    for (const { province, value } of candidates) {
      if (result.length >= limit) break;

      const label = labelFor(province.code, value);
      if (label === null) continue;

      const anchor = PROVINCE_ANCHORS[province.code];
      if (anchor === undefined) continue;

      const anchorX = ((anchor.x - box.x) / box.w) * width;
      const anchorY = ((anchor.y - box.y) / box.h) * height;

      if (
        anchorX < 0 ||
        anchorX > width ||
        anchorY < 0 ||
        anchorY > height
      ) {
        continue;
      }

      const labelWidth = estimateWidth(label.title, label.value);
      const left = Math.min(
        Math.max(0, anchorX - labelWidth / 2),
        Math.max(0, width - labelWidth),
      );
      const top = Math.min(
        Math.max(0, anchorY - LABEL_HEIGHT - TAIL),
        Math.max(0, height - LABEL_HEIGHT),
      );

      const next: Placed = {
        code: province.code,
        title: label.title,
        value: label.value,
        color: colorForRatio(maxValue > 0 ? value / maxValue : 0),
        anchorX,
        anchorY,
        left,
        top,
        width: labelWidth,
      };

      if (result.some((other) => overlaps(next, other))) continue;

      result.push(next);
    }

    return result;
  }, [values, maxValue, box, width, height, labelFor]);

  return (
    <View className="absolute inset-0" pointerEvents="none">
      {placed.map((label) => (
        <View key={label.code}>
          <View
            className="absolute h-1.5 w-1.5 rounded-full border border-white"
            style={{
              left: label.anchorX - 3,
              top: label.anchorY - 3,
              backgroundColor: label.color,
            }}
          />
          <View
            className="absolute rounded-lg border border-border bg-card px-2 py-1"
            style={{ left: label.left, top: label.top, width: label.width }}
          >
            <View className="flex-row items-center gap-1">
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              <Text
                numberOfLines={1}
                className="flex-1 text-[9px] font-medium text-muted-foreground"
              >
                {label.title}
              </Text>
            </View>
            <Text numberOfLines={1} className="text-[11px] font-bold text-foreground">
              {label.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
