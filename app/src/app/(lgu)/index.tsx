import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { CaretRight, Megaphone, Storefront } from "phosphor-react-native";

import { useDashboardStats, useHeatmap } from "@/lib/queries/dashboard";
import { useIncidentReports } from "@/lib/queries/incident-reports";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { LeafletMap } from "@/components/leaflet-map";
import { NotificationBell } from "@/components/notification-bell";

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
  const pending = useIncidentReports({ status: "submitted" });

  const pendingReports = (pending.data ?? []).length;

  const refreshing = stats.isRefetching || heatmap.isRefetching;
  const onRefresh = useCallback(() => {
    stats.refetch();
    heatmap.refetch();
  }, [stats, heatmap]);

  const heatMarkers = (heatmap.data ?? [])
    .filter((b) => b.latitude != null && b.longitude != null)
    .map((b) => ({
      lat: Number(b.latitude),
      lng: Number(b.longitude),
      title: `${b.name}: ${Math.round(b.depletion_rate * 100)}% depleted`,
      color: depletionColor(b.depletion_rate),
    }));

  return (
    <Screen edges={["top"]} refreshing={refreshing} onRefresh={onRefresh}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text variant="title">DRRMO Dashboard</Text>
          <Text variant="subtitle">
            Real-time relief distribution overview.
          </Text>
        </View>
        <NotificationBell />
      </View>

      <Link href="/reports" asChild>
        <Pressable className="active:opacity-80">
          <Card className="flex-row items-center gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#ce112614" }}
            >
              <Megaphone size={22} color={PH_COLORS.red} weight="duotone" />
            </View>
            <View className="flex-1">
              <Text variant="label">Incident reports</Text>
              <Text variant="caption">
                Verify what citizens send in, then refer it to an agency.
              </Text>
            </View>
            {pendingReports > 0 ? (
              <Badge variant="destructive" label={String(pendingReports)} />
            ) : (
              <CaretRight size={18} color={PH_COLORS.mutedForeground} />
            )}
          </Card>
        </Pressable>
      </Link>

      <Link href="/relief" asChild>
        <Pressable className="active:opacity-80">
          <Card className="flex-row items-center gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#0038a814" }}
            >
              <Storefront size={22} color={PH_COLORS.blue} weight="duotone" />
            </View>
            <View className="flex-1">
              <Text variant="label">Relief operations</Text>
              <Text variant="caption">
                Add service points, set stock, adjust program caps.
              </Text>
            </View>
            <CaretRight size={18} color={PH_COLORS.mutedForeground} />
          </Card>
        </Pressable>
      </Link>

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

          {stats.data.blocked_claims.total > 0 ? (
            <View className="gap-2">
              <Text variant="heading">Leakage prevented</Text>
              <Card className="gap-2">
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-3xl font-bold text-foreground">
                    {stats.data.blocked_claims.leakage_prevented}
                  </Text>
                  <Text variant="caption" className="flex-1">
                    ghost, duplicate or over-cap claims refused before any stock
                    or money moved.
                  </Text>
                </View>
                {stats.data.blocked_claims.by_reason.map((r) => (
                  <View
                    key={r.reason}
                    className="flex-row items-center justify-between border-t border-border pt-2"
                  >
                    <Text variant="caption" className="flex-1">
                      {r.label}
                    </Text>
                    <Badge
                      variant={r.is_leakage_prevented ? "destructive" : "muted"}
                      label={String(r.count)}
                    />
                  </View>
                ))}
              </Card>
            </View>
          ) : null}

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
        {heatMarkers.length > 0 ? (
          <LeafletMap markers={heatMarkers} height={280} />
        ) : null}
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
