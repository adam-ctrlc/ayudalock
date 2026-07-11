import { useCallback } from "react";
import { View } from "react-native";

import { useDashboardStats, useHeatmap } from "@/lib/queries/dashboard";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

function StatCard({
  label,
  count,
  quantity,
}: {
  label: string;
  count: number;
  quantity: number;
}) {
  return (
    <Card className="flex-1">
      <Text variant="caption">{label}</Text>
      <Text className="text-3xl font-bold text-primary">{count}</Text>
      <Text variant="caption">{quantity} units</Text>
    </Card>
  );
}

function depletionColor(rate: number) {
  if (rate >= 0.7) return PH_COLORS.red;
  if (rate >= 0.4) return PH_COLORS.yellow;
  return PH_COLORS.success;
}

function DepletionBar({ rate }: { rate: number }) {
  const pct = Math.min(100, Math.round(rate * 100));
  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <View
        style={{ width: `${pct}%`, backgroundColor: depletionColor(rate) }}
        className="h-full rounded-full"
      />
    </View>
  );
}

export default function LguDashboard() {
  const stats = useDashboardStats();
  const heatmap = useHeatmap();

  const refreshing = stats.isRefetching || heatmap.isRefetching;
  const onRefresh = useCallback(() => {
    stats.refetch();
    heatmap.refetch();
  }, [stats, heatmap]);

  return (
    <Screen edges={[]} refreshing={refreshing} onRefresh={onRefresh}>
      <View className="gap-1">
        <Text variant="title">DRRMO Dashboard</Text>
        <Text variant="subtitle">Real-time relief distribution overview.</Text>
      </View>

      {stats.isLoading ? (
        <View className="flex-row gap-3">
          <Skeleton className="h-24 flex-1 rounded-2xl" />
          <Skeleton className="h-24 flex-1 rounded-2xl" />
        </View>
      ) : stats.isError ? (
        <Text className="text-destructive">Couldn&apos;t load stats.</Text>
      ) : stats.data ? (
        <>
          <View className="flex-row gap-3">
            <StatCard
              label="Active locks"
              count={stats.data.active_locks.count}
              quantity={stats.data.active_locks.quantity}
            />
            <StatCard
              label="Redemptions"
              count={stats.data.redemptions.count}
              quantity={stats.data.redemptions.quantity}
            />
          </View>

          {stats.data.subsidies_by_program.length > 0 ? (
            <View className="gap-2">
              <Text variant="heading">Subsidies released</Text>
              {stats.data.subsidies_by_program.map((s) => (
                <Card
                  key={s.program_id}
                  className="flex-row items-center justify-between"
                >
                  <Text variant="label">{s.program_name}</Text>
                  <Text variant="label">
                    {s.quantity} {s.unit}
                  </Text>
                </Card>
              ))}
            </View>
          ) : null}

          {stats.data.redemptions_by_location.length > 0 ? (
            <View className="gap-2">
              <Text variant="heading">Redemptions by location</Text>
              {stats.data.redemptions_by_location.map((l) => (
                <Card
                  key={l.location_id}
                  className="flex-row items-center justify-between"
                >
                  <Text variant="label" className="flex-1 pr-2">
                    {l.location_name}
                  </Text>
                  <Text variant="caption">
                    {l.redemptions} claims · {l.quantity} units
                  </Text>
                </Card>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      <View className="gap-2">
        <Text variant="heading">Barangay stock heat map</Text>
        {heatmap.isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : heatmap.isError ? (
          <Text className="text-destructive">Couldn&apos;t load heat map.</Text>
        ) : (
          heatmap.data?.map((b) => (
            <Card key={b.barangay_id} className="gap-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text variant="label">{b.name}</Text>
                  <Text variant="caption">{b.city}</Text>
                </View>
                <Text variant="label">{Math.round(b.depletion_rate * 100)}%</Text>
              </View>
              <DepletionBar rate={b.depletion_rate} />
              <View className="flex-row justify-between">
                <Text variant="caption">Available {b.available}</Text>
                <Text variant="caption">Locked {b.locked}</Text>
                <Text variant="caption">Redeemed {b.redeemed}</Text>
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}
