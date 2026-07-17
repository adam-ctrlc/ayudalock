import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Trash } from "phosphor-react-native";

import { ApiError } from "@/lib/api/client";
import type { InterruptionType } from "@/lib/api/energy";
import {
  useCreateInterruption,
  useDeleteInterruption,
  useGridStatus,
  useInterruptions,
} from "@/lib/queries/energy";
import { useLocations } from "@/lib/queries/locations";
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialog } from "@/components/ui/dialog";
import {
  gridLevelVariant,
  interruptionWindow,
} from "@/components/energy/energy-labels";
import { PowerStatusBadge } from "@/components/energy/power-status-badge";

type Barangay = { id: number; name: string };

const TYPES: { key: InterruptionType; label: string }[] = [
  { key: "rotating", label: "Rotating" },
  { key: "scheduled", label: "Scheduled" },
  { key: "emergency", label: "Emergency" },
  { key: "unplanned", label: "Unplanned" },
];

const DURATIONS: { key: string; label: string; startInHours: number; hours: number }[] = [
  { key: "now2", label: "Now, 2h", startInHours: 0, hours: 2 },
  { key: "now4", label: "Now, 4h", startInHours: 0, hours: 4 },
  { key: "in6", label: "In 6h, 3h", startInHours: 6, hours: 3 },
];

export function EnergyAdmin() {
  const grid = useGridStatus();
  const interruptions = useInterruptions();
  const locations = useLocations();
  const create = useCreateInterruption();
  const remove = useDeleteInterruption();
  const dialog = useDialog();

  const [type, setType] = useState<InterruptionType>("rotating");
  const [utility, setUtility] = useState("Meralco");
  const [barangayId, setBarangayId] = useState<number | null>(null);
  const [households, setHouseholds] = useState("");
  const [duration, setDuration] = useState(DURATIONS[0].key);

  const barangays = useMemo(() => {
    const seen = new Map<number, Barangay>();

    for (const location of locations.data ?? []) {
      if (location.barangay_id != null && location.barangay) {
        seen.set(location.barangay_id, {
          id: location.barangay_id,
          name: location.barangay,
        });
      }
    }

    return [...seen.values()];
  }, [locations.data]);

  function submit() {
    if (barangayId === null) {
      dialog.alert({ title: "Pick a barangay", message: "Choose the affected barangay first." });
      return;
    }

    const preset = DURATIONS.find((d) => d.key === duration) ?? DURATIONS[0];
    const start = new Date(Date.now() + preset.startInHours * 3600_000);
    const end = new Date(start.getTime() + preset.hours * 3600_000);

    create.mutate(
      {
        type,
        utility: utility.trim() || "Meralco",
        barangay_id: barangayId,
        households_affected: households ? Number(households) : undefined,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
      },
      {
        onSuccess: () => {
          setHouseholds("");
          dialog.alert({
            title: "Interruption declared",
            message: "Affected service points were switched to their backup status.",
          });
        },
        onError: (e) =>
          dialog.alert({
            title: "Could not declare",
            message: e instanceof ApiError ? e.message : "Please try again.",
          }),
      },
    );
  }

  return (
    <>
      <Text variant="subtitle">
        Declare interruptions and see which service points lose power.
      </Text>

      <Text variant="heading">Grid status</Text>
      {grid.isLoading ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : (
        <View className="gap-2">
          {(grid.data ?? []).map((status) => (
            <Card key={status.id} className="gap-1.5">
              <View className="flex-row items-center justify-between gap-2">
                <Text variant="label">{status.island_label}</Text>
                <Badge
                  variant={gridLevelVariant(status.level)}
                  label={status.level_label}
                />
              </View>
              <Text variant="caption">
                Reserve {status.reserve_mw} MW · demand {status.demand_mw} MW of{" "}
                {status.capacity_mw} MW
              </Text>
            </Card>
          ))}
        </View>
      )}

      <Card className="gap-3">
        <CardHeader>
          <CardTitle>Declare an interruption</CardTitle>
        </CardHeader>

        <Field label="Type">
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map((t) => {
              const active = type === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setType(t.key)}
                  className={cn(
                    "rounded-xl border px-3 py-2",
                    active ? "border-primary bg-primary" : "border-border bg-background",
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      active ? "text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Barangay">
          <View className="flex-row flex-wrap gap-2">
            {barangays.map((b) => {
              const active = barangayId === b.id;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => setBarangayId(b.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2",
                    active ? "border-primary bg-primary" : "border-border bg-background",
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      active ? "text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {b.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Window">
          <View className="flex-row gap-2">
            {DURATIONS.map((d) => {
              const active = duration === d.key;
              return (
                <Pressable
                  key={d.key}
                  onPress={() => setDuration(d.key)}
                  className={cn(
                    "flex-1 items-center rounded-xl border py-2.5",
                    active ? "border-primary bg-primary" : "border-border bg-background",
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      active ? "text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Utility">
          <Input value={utility} onChangeText={setUtility} placeholder="Meralco" />
        </Field>

        <Field label="Households affected">
          <Input
            value={households}
            onChangeText={setHouseholds}
            keyboardType="number-pad"
            placeholder="4200"
          />
        </Field>

        <Button label="Declare interruption" loading={create.isPending} onPress={submit} />
      </Card>

      <Text variant="heading">Service points</Text>
      {locations.isLoading ? (
        <Skeleton className="h-16 w-full rounded-2xl" />
      ) : (
        <View className="gap-2">
          {(locations.data ?? []).map((location) => (
            <Card
              key={location.id}
              className="flex-row items-center justify-between p-3"
            >
              <View className="flex-1 pr-2">
                <Text variant="label">{location.name}</Text>
                {location.has_generator ? (
                  <Text variant="caption">Backup generator on site</Text>
                ) : null}
              </View>
              <PowerStatusBadge status={location.power_status} />
            </Card>
          ))}
        </View>
      )}

      <Text variant="heading">Scheduled and ongoing</Text>
      {interruptions.isLoading ? (
        <Skeleton className="h-16 w-full rounded-2xl" />
      ) : (interruptions.data ?? []).length === 0 ? (
        <Card>
          <Text variant="caption">Nothing scheduled.</Text>
        </Card>
      ) : (
        <View className="gap-3">
          {(interruptions.data ?? []).map((item) => (
            <Card key={item.id} className="flex-row items-start gap-3">
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2">
                  <Text variant="label" className="flex-1">
                    {item.barangay ?? item.province ?? item.utility}
                  </Text>
                  <Badge
                    variant={item.is_active_now ? "destructive" : "muted"}
                    label={item.is_active_now ? "ongoing" : item.type_label}
                  />
                </View>
                <Text variant="caption">
                  {interruptionWindow(item.starts_at, item.ends_at)} · {item.utility}
                </Text>
              </View>
              <Pressable
                hitSlop={8}
                onPress={async () => {
                  const ok = await dialog.confirm({
                    title: "Remove interruption",
                    message: "Service points will be marked powered again.",
                  });

                  if (ok) {
                    remove.mutate(item.id);
                  }
                }}
              >
                <Trash size={18} color={PH_COLORS.red} />
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </>
  );
}
