import { useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  CheckCircle,
  GasPump,
  HandHeart,
  Storefront,
} from "phosphor-react-native";

import { ApiError } from "@/lib/api/client";
import type { Inventory, Location } from "@/lib/api/locations";
import { useLocations } from "@/lib/queries/locations";
import { useEligibility } from "@/lib/queries/eligibility";
import { useCreateAllocation } from "@/lib/queries/allocations";
import { useCreateReminder } from "@/lib/queries/claim-reminders";
import { scheduleClaimReminder } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { unitLabel } from "@/lib/units";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { useDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { ClaimHistory } from "@/components/claim-history";
import { MyVouchers } from "@/components/my-vouchers";
import { ClaimRemindersList } from "@/components/claim-reminders-list";
import { LeafletMap } from "@/components/leaflet-map";

function Step({ num, text }: { num: string; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
        <Text className="text-sm font-bold text-primary-foreground">{num}</Text>
      </View>
      <Text className="flex-1 text-sm text-foreground">{text}</Text>
    </View>
  );
}

type View2 = "available" | "saved" | "vouchers" | "history";

const VIEW_LABELS: Record<View2, string> = {
  available: "Available",
  saved: "Saved",
  vouchers: "Vouchers",
  history: "History",
};

export default function CitizenLocations() {
  const eligibility = useEligibility();
  const locations = useLocations();
  const claim = useCreateAllocation();
  const saveReminder = useCreateReminder();
  const dialog = useDialog();
  const params = useLocalSearchParams<{ view?: string }>();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [view, setView] = useState<View2>(
    params.view === "saved" ? "saved" : "available",
  );
  const [pending, setPending] = useState<{
    locationId: number;
    commodityId: number;
    quantity: number;
  } | null>(null);

  const eligibleProgramIds = new Set(
    (eligibility.data?.programs ?? []).map((p) => p.id),
  );

  function claimableItems(location: Location): Inventory[] {
    return (location.inventories ?? []).filter(
      (inv) =>
        Number(inv.quantity_available) > 0 &&
        inv.commodity?.program_id !== undefined &&
        eligibleProgramIds.has(inv.commodity.program_id),
    );
  }

  const loading = eligibility.isLoading || locations.isLoading;

  const visibleLocations = (locations.data ?? [])
    .map((loc) => ({ loc, items: claimableItems(loc) }))
    .filter((entry) => entry.items.length > 0);

  const claimMarkers = visibleLocations
    .filter(({ loc }) => loc.latitude != null && loc.longitude != null)
    .map(({ loc }) => ({
      lat: Number(loc.latitude),
      lng: Number(loc.longitude),
      title: loc.name,
      color: loc.type === "gas_station" ? PH_COLORS.red : PH_COLORS.blue,
    }));

  function onClaim(locationId: number, commodityId: number, quantity: number) {
    claim.mutate(
      { location_id: locationId, commodity_id: commodityId, quantity },
      {
        onSuccess: () => {
          setView("vouchers");
          dialog.alert({
            title: "Reserved for you!",
            message:
              "Your goods are saved. Show the code or QR here in the Vouchers tab at the store.",
          });
        },
        onError: (e) =>
          dialog.alert({
            title: "Could not reserve",
            message: e instanceof ApiError ? e.message : "Please try again.",
          }),
      },
    );
  }

  function toYmd(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function onSave(
    locationId: number,
    commodityId: number,
    quantity: number,
    remindOn: string,
  ) {
    saveReminder.mutate(
      {
        location_id: locationId,
        commodity_id: commodityId,
        quantity,
        remind_on: remindOn,
      },
      {
        onSuccess: (reminder) => {
          setView("saved");
          scheduleClaimReminder({
            id: reminder.id,
            title: "Time to claim your relief",
            body: `${reminder.commodity.name ?? "Your item"} at ${
              reminder.location.name ?? "the store"
            }`,
            date: reminder.remind_on ?? remindOn,
          });
          dialog.alert({
            title: "Saved to your plan",
            message: "Find it in the Saved tab. We'll remind you on your chosen day.",
          });
        },
        onError: (e) =>
          dialog.alert({
            title: "Could not save",
            message: e instanceof ApiError ? e.message : "Please try again.",
          }),
      },
    );
  }

  function onPickDate(event: DateTimePickerEvent, date?: Date) {
    const target = pending;
    setPending(null);
    if (event.type !== "set" || !date || !target) return;
    onSave(target.locationId, target.commodityId, target.quantity, toYmd(date));
  }

  return (
    <Screen
      edges={["top"]}
      refreshing={locations.isRefetching}
      onRefresh={() => locations.refetch()}
    >
      <View className="gap-0.5">
        <Text variant="title">Claim relief</Text>
        <Text variant="subtitle">
          Reserve your goods first, then just show a code at the store.
        </Text>
      </View>

      <View className="flex-row gap-2">
        {(["available", "saved", "vouchers", "history"] as View2[]).map((v) => {
          const active = view === v;
          return (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              className={cn(
                "flex-1 items-center rounded-xl border py-2.5",
                active
                  ? "border-primary bg-primary"
                  : "border-border bg-background",
              )}
            >
              <Text
                numberOfLines={1}
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {VIEW_LABELS[v]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {view === "history" ? (
        <ClaimHistory />
      ) : view === "vouchers" ? (
        <MyVouchers />
      ) : view === "saved" ? (
        <ClaimRemindersList onClaimed={() => setView("vouchers")} />
      ) : (
        <>
          <Card className="gap-3 border-0 bg-secondary">
            <View className="flex-row items-center gap-2">
              <HandHeart size={22} color={PH_COLORS.blue} weight="fill" />
              <Text variant="heading">How to claim</Text>
            </View>
            <Step num="1" text="Press the green Claim button below." />
            <Step
              num="2"
              text="Show the code or QR from the Vouchers tab at the store."
            />
            <Step num="3" text="Get your goods. No lining up, no wasted fare." />
          </Card>

          {loading ? (
            <View className="gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl" />
              ))}
            </View>
          ) : locations.isError ? (
            <Text className="text-destructive">
              Couldn&apos;t load the stores.
            </Text>
          ) : visibleLocations.length === 0 ? (
            <Card className="items-center gap-2 py-6">
              <Text variant="caption" className="text-center">
                There is nothing for you to claim right now. Please check back
                later.
              </Text>
            </Card>
          ) : (
            <>
              {claimMarkers.length > 0 ? (
                <LeafletMap markers={claimMarkers} />
              ) : null}
              {visibleLocations.map(({ loc, items }) => {
              const isStore = loc.type === "kadiwa_store";
              const accent = isStore ? PH_COLORS.blue : PH_COLORS.red;
              const tint = isStore ? "#0038a814" : "#ce112614";
              return (
                <Card key={loc.id} className="gap-4">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: tint }}
                    >
                      {isStore ? (
                        <Storefront size={24} color={accent} weight="duotone" />
                      ) : (
                        <GasPump size={24} color={accent} weight="duotone" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text variant="heading">{loc.name}</Text>
                      <Text variant="caption">
                        {(isStore ? "Kadiwa Store" : "Gas Station") +
                          (loc.barangay ? ` · ${loc.barangay}` : "")}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: PH_COLORS.success }}
                      />
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: PH_COLORS.success }}
                      >
                        Open
                      </Text>
                    </View>
                  </View>

                  <View>
                    {items.map((inv, idx) => {
                      const available = Number(inv.quantity_available);
                      const unit = inv.commodity?.unit ?? "";
                      const key = `${loc.id}:${inv.commodity_id}`;
                      const value = qty[key] ?? 1;
                      const claimingThis =
                        claim.isPending &&
                        claim.variables?.commodity_id === inv.commodity_id &&
                        claim.variables?.location_id === loc.id;
                      const savingThis =
                        saveReminder.isPending &&
                        saveReminder.variables?.commodity_id ===
                          inv.commodity_id &&
                        saveReminder.variables?.location_id === loc.id;

                      return (
                        <View
                          key={inv.commodity_id}
                          className={cn(
                            "gap-3",
                            idx > 0 && "mt-4 border-t border-border pt-4",
                          )}
                        >
                          <View className="flex-row items-start justify-between gap-2">
                            <View className="flex-1">
                              <Text variant="label" className="text-base">
                                {inv.commodity?.name}
                              </Text>
                              <Text variant="caption">
                                {available} {unitLabel(unit)} in stock
                              </Text>
                            </View>
                            <View
                              className="flex-row items-center gap-1 rounded-full px-2 py-1"
                              style={{ backgroundColor: "#12805c14" }}
                            >
                              <CheckCircle
                                size={14}
                                color={PH_COLORS.success}
                                weight="fill"
                              />
                              <Text
                                className="text-xs font-semibold"
                                style={{ color: PH_COLORS.success }}
                              >
                                Claimable
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center justify-between">
                            <Text variant="caption">Quantity</Text>
                            <Stepper
                              value={value}
                              onChange={(v) =>
                                setQty((s) => ({ ...s, [key]: v }))
                              }
                              min={1}
                              max={Math.floor(available)}
                            />
                          </View>

                          <Button
                            variant="success"
                            label={`Claim ${value} ${unitLabel(unit)}`}
                            loading={claimingThis}
                            onPress={() =>
                              onClaim(loc.id, inv.commodity_id, value)
                            }
                          />
                          <Button
                            variant="outline"
                            label="Remind me to claim this"
                            loading={savingThis}
                            onPress={() =>
                              setPending({
                                locationId: loc.id,
                                commodityId: inv.commodity_id,
                                quantity: value,
                              })
                            }
                          />
                        </View>
                      );
                    })}
                  </View>
                </Card>
              );
            })}
            </>
          )}
        </>
      )}

      {pending ? (
        <DateTimePicker
          value={new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={onPickDate}
        />
      ) : null}
    </Screen>
  );
}
