import { Pressable, View } from "react-native";
import { CloudRain, X } from "phosphor-react-native";

import type { ProvinceWeather } from "@/lib/api/weather";
import { useProvinceDetail } from "@/lib/queries/heatmap";
import { PH_COLORS } from "@/lib/theme";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { colorForRatio } from "@/components/heatmap/severity-scale";
import { hazardLabel, hazardWhen } from "@/components/heatmap/hazard-labels";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text variant="caption">{label}</Text>
      <Text className="text-xl font-bold">{value}</Text>
    </View>
  );
}

export function ProvinceDetail({
  code,
  weather,
  onClose,
}: {
  code: string;
  weather?: ProvinceWeather | null;
  onClose: () => void;
}) {
  const detail = useProvinceDetail(code);
  const data = detail.data;

  return (
    <Card className="gap-3 border-primary">
      <View className="flex-row items-start justify-between gap-2">
        <Text variant="heading">{data?.name ?? code}</Text>
        <Pressable onPress={onClose} hitSlop={8} className="active:opacity-60">
          <X size={20} color={PH_COLORS.mutedForeground} />
        </Pressable>
      </View>

      {detail.isLoading ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : data ? (
        <>
          <View className="flex-row gap-3">
            <Stat
              label="People affected"
              value={data.affected_people.toLocaleString()}
            />
            <Stat label="Severity" value={`${data.severity}/100`} />
            <Stat label="Events" value={String(data.event_count)} />
          </View>

          {weather ? (
            <View className="flex-row items-center gap-2">
              <CloudRain size={16} color={PH_COLORS.blue} weight="duotone" />
              <Text variant="caption">
                {weather.description ?? "Weather"}
                {weather.temperature != null
                  ? ` · ${Math.round(weather.temperature)}°C`
                  : ""}
                {weather.precipitation > 0
                  ? ` · ${weather.precipitation}mm rain`
                  : ""}
                {weather.wind_speed != null
                  ? ` · ${Math.round(weather.wind_speed)} km/h wind`
                  : ""}
              </Text>
            </View>
          ) : null}

          {data.events.length === 0 ? (
            <Text variant="caption">
              No recorded hazards here in the selected window.
            </Text>
          ) : (
            <View className="gap-2">
              {data.events.slice(0, 6).map((event) => (
                <View
                  key={event.id}
                  className="flex-row items-start gap-2 border-t border-border pt-2"
                >
                  <View
                    className="mt-1.5 h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorForRatio(event.severity / 100) }}
                  />
                  <View className="flex-1">
                    <Text variant="label" numberOfLines={1}>
                      {hazardLabel(event.type)}
                      {event.magnitude != null ? ` M${event.magnitude}` : ""}
                      {" · "}
                      {event.title}
                    </Text>
                    <Text variant="caption">
                      {event.affected_people != null
                        ? `${event.affected_people.toLocaleString()} affected · `
                        : ""}
                      {hazardWhen(event.occurred_at)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text className="text-destructive">Couldn&apos;t load this province.</Text>
      )}
    </Card>
  );
}
