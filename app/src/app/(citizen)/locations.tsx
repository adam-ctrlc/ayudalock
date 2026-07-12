import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
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
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { ClaimHistory } from "@/components/claim-history";
import { MyVouchers } from "@/components/my-vouchers";

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

type View2 = "available" | "vouchers" | "history";

export default function CitizenLocations() {
  const eligibility = useEligibility();
  const locations = useLocations();
  const claim = useCreateAllocation();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [view, setView] = useState<View2>("available");

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

  function onClaim(locationId: number, commodityId: number, quantity: number) {
    claim.mutate(
      { location_id: locationId, commodity_id: commodityId, quantity },
      {
        onSuccess: () => {
          setView("vouchers");
          Alert.alert(
            "Reserved for you!",
            "Your goods are saved. Show the code or QR here in the Vouchers tab at the store.",
          );
        },
        onError: (e) =>
          Alert.alert(
            "Could not reserve",
            e instanceof ApiError ? e.message : "Please try again.",
          ),
      },
    );
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
        {(["available", "vouchers", "history"] as View2[]).map((v) => {
          const active = view === v;
          const label =
            v === "available"
              ? "Available"
              : v === "vouchers"
                ? "Vouchers"
                : "History";
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
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {view === "history" ? (
        <ClaimHistory />
      ) : view === "vouchers" ? (
        <MyVouchers />
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
            visibleLocations.map(({ loc, items }) => {
              const isStore = loc.type === "kadiwa_store";
              return (
                <Card key={loc.id} className="gap-3">
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      {isStore ? (
                        <Storefront
                          size={22}
                          color={PH_COLORS.blue}
                          weight="duotone"
                        />
                      ) : (
                        <GasPump
                          size={22}
                          color={PH_COLORS.red}
                          weight="duotone"
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text variant="heading">{loc.name}</Text>
                      <Text variant="caption">{loc.barangay ?? ""}</Text>
                    </View>
                    <Badge variant="success" label="Open" />
                  </View>

                  {items.map((inv) => {
                    const available = Number(inv.quantity_available);
                    const unit = inv.commodity?.unit ?? "";
                    const key = `${loc.id}:${inv.commodity_id}`;
                    const value = qty[key] ?? 1;
                    const claimingThis =
                      claim.isPending &&
                      claim.variables?.commodity_id === inv.commodity_id &&
                      claim.variables?.location_id === loc.id;

                    return (
                      <View
                        key={inv.commodity_id}
                        className="gap-2.5 rounded-xl bg-secondary p-3"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 pr-2">
                            <Text variant="label">{inv.commodity?.name}</Text>
                            <Text variant="caption">
                              {available} {unit} available
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <CheckCircle
                              size={16}
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

                        <View className="flex-row items-center gap-3">
                          <Stepper
                            value={value}
                            onChange={(v) =>
                              setQty((s) => ({ ...s, [key]: v }))
                            }
                            min={1}
                            max={Math.floor(available)}
                          />
                          <Button
                            variant="success"
                            size="sm"
                            className="flex-1"
                            label={`Claim ${value} ${unit}`}
                            loading={claimingThis}
                            onPress={() =>
                              onClaim(loc.id, inv.commodity_id, value)
                            }
                          />
                        </View>
                      </View>
                    );
                  })}
                </Card>
              );
            })
          )}
        </>
      )}
    </Screen>
  );
}
