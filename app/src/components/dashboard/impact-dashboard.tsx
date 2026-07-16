import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";

import { useProvinceImpacts } from "@/lib/queries/heatmap";
import { useProvinceWeather } from "@/lib/queries/weather";
import { useOutageMap } from "@/lib/queries/energy";
import type { ProvinceWeather } from "@/lib/api/weather";
import { useAuth } from "@/lib/auth/context";
import { PH_VIEWBOX } from "@/lib/geo/ph-provinces";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { BackBar } from "@/components/back-bar";
import { Panel } from "@/components/dashboard/panel";
import { PhilippinesHeatmap } from "@/components/heatmap/philippines-heatmap";
import { MetricToggle } from "@/components/heatmap/metric-toggle";
import { ProvinceDetail } from "@/components/heatmap/province-detail";
import type { HeatMetric } from "@/components/heatmap/severity-scale";
import { HazardList } from "@/components/hazard-list";
import { WeatherList } from "@/components/heatmap/weather-list";
import { OutageList } from "@/components/energy/outage-list";
import { GridAlertBanner } from "@/components/energy/grid-alert-banner";
import { LatestAlerts } from "@/components/latest-alerts";

const ASPECT = PH_VIEWBOX.width / PH_VIEWBOX.height;

function metricCaption(metric: HeatMetric): string {
  switch (metric) {
    case "affected":
      return "Shaded by people affected (last 30 days).";
    case "severity":
      return "Shaded by hazard severity (0 to 100).";
    case "rainfall":
      return "Shaded by current rainfall (mm).";
    case "outage":
      return "Shaded by households without power (next 24 hours).";
  }
}

export function ImpactDashboard({ showBack = false }: { showBack?: boolean }) {
  const { user } = useAuth();
  const impacts = useProvinceImpacts(30);
  const weather = useProvinceWeather();
  const outages = useOutageMap(24);
  const [metric, setMetric] = useState<HeatMetric>("affected");
  const [selected, setSelected] = useState<string | null>(null);
  const [lockScroll, setLockScroll] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const detailY = useRef(0);
  const pendingScroll = useRef(false);

  function handleSelect(code: string) {
    pendingScroll.current = true;
    setSelected(code);
  }

  const rows = impacts.data ?? [];
  const weatherRows = weather.data ?? [];
  const weatherByCode: Record<string, ProvinceWeather> = {};
  for (const w of weatherRows) weatherByCode[w.code] = w;

  const outageRows = outages.data ?? [];

  const values: Record<string, number> = {};
  let maxValue = metric === "severity" ? 100 : 1;

  switch (metric) {
    case "rainfall":
      for (const w of weatherRows) {
        values[w.code] = w.precipitation;
        if (w.precipitation > maxValue) maxValue = w.precipitation;
      }
      break;
    case "outage":
      for (const row of outageRows) {
        values[row.code] = row.households_affected;
        if (row.households_affected > maxValue) maxValue = row.households_affected;
      }
      break;
    default:
      for (const row of rows) {
        const value = metric === "affected" ? row.affected_people : row.severity;
        values[row.code] = value;
        if (metric === "affected" && value > maxValue) maxValue = value;
      }
      break;
  }

  return (
    <Screen
      edges={["top"]}
      scrollRef={scrollRef}
      scrollEnabled={!lockScroll}
      refreshing={impacts.isRefetching}
      onRefresh={() => impacts.refetch()}
    >
      {showBack ? <BackBar /> : null}

      <View className="gap-0.5">
        <Text variant="title">Disaster Impact Map</Text>
        <Text variant="subtitle">
          Live earthquakes, typhoons, and flooding across the Philippines.
        </Text>
      </View>

      <GridAlertBanner />

      <MetricToggle value={metric} onChange={setMetric} />

      {impacts.isLoading ? (
        <View className="w-full" style={{ aspectRatio: ASPECT }}>
          <Skeleton className="h-full w-full rounded-2xl" />
        </View>
      ) : impacts.isError ? (
        <Text className="text-destructive">Couldn&apos;t load the impact map.</Text>
      ) : (
        <PhilippinesHeatmap
          values={values}
          maxValue={maxValue}
          selectedCode={selected}
          onSelect={handleSelect}
          onInteractionChange={setLockScroll}
        />
      )}

      <Text variant="caption">
        {metricCaption(metric)} Tap a province to zoom in and see details, or use
        the + / - controls.
      </Text>

      {selected ? (
        <View
          onLayout={(e) => {
            detailY.current = e.nativeEvent.layout.y;
            if (pendingScroll.current) {
              pendingScroll.current = false;
              scrollRef.current?.scrollTo({
                y: Math.max(0, detailY.current - 16),
                animated: true,
              });
            }
          }}
        >
          <ProvinceDetail
            code={selected}
            weather={weatherByCode[selected] ?? null}
            onClose={() => setSelected(null)}
          />
        </View>
      ) : null}

      {metric === "rainfall" ? (
        <Panel title="Weather by province">
          <WeatherList />
        </Panel>
      ) : null}

      {metric === "outage" ? (
        <Panel title="Power interruptions">
          <OutageList />
        </Panel>
      ) : null}

      <Panel title="Recent hazards">
        <HazardList />
      </Panel>

      {user ? <LatestAlerts /> : null}
    </Screen>
  );
}
