import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import { listLocations } from "@/lib/api/locations";
import { createAllocation } from "@/lib/api/allocations";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CitizenLocations() {
  const qc = useQueryClient();
  const locations = useQuery({
    queryKey: ["locations", "citizen"],
    queryFn: () => listLocations(),
  });
  const [expanded, setExpanded] = useState<number | null>(null);
  const [qty, setQty] = useState<Record<number, string>>({});

  const claim = useMutation({
    mutationFn: (body: {
      location_id: number;
      commodity_id: number;
      quantity: number;
    }) => createAllocation(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allocations"] });
      qc.invalidateQueries({ queryKey: ["locations"] });
      Alert.alert(
        "Locked!",
        "Your goods are reserved. Open the Home tab to see your voucher.",
      );
    },
    onError: (e) =>
      Alert.alert(
        "Could not lock",
        e instanceof ApiError ? e.message : "Please try again.",
      ),
  });

  return (
    <Screen
      edges={[]}
      refreshing={locations.isRefetching}
      onRefresh={() => locations.refetch()}
    >
      <View className="gap-1">
        <Text variant="title">Claim relief</Text>
        <Text variant="subtitle">
          Reserve goods before you travel, no wasted fare.
        </Text>
      </View>

      {locations.isLoading ? (
        <View className="gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </View>
      ) : locations.isError ? (
        <Text className="text-destructive">Couldn&apos;t load locations.</Text>
      ) : (
        locations.data?.map((loc) => {
          const open = expanded === loc.id;
          return (
            <Card key={loc.id} className="gap-3">
              <Pressable
                onPress={() => setExpanded(open ? null : loc.id)}
                className="flex-row items-center justify-between"
              >
                <View className="flex-1 pr-2">
                  <Text variant="heading">{loc.name}</Text>
                  <Text variant="caption">{loc.barangay ?? ""}</Text>
                </View>
                <Badge
                  variant={loc.type === "kadiwa_store" ? "default" : "accent"}
                  label={loc.type === "kadiwa_store" ? "Kadiwa" : "Fuel"}
                />
              </Pressable>

              {open ? (
                <View className="gap-3">
                  {(loc.inventories ?? []).length === 0 ? (
                    <Text variant="caption">No stock listed here.</Text>
                  ) : (
                    loc.inventories?.map((inv) => (
                      <View
                        key={inv.commodity_id}
                        className="gap-2 rounded-xl bg-secondary p-3"
                      >
                        <View className="flex-row items-center justify-between">
                          <Text variant="label">{inv.commodity?.name}</Text>
                          <Text variant="caption">
                            {inv.quantity_available} {inv.commodity?.unit} left
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Input
                            className="flex-1"
                            keyboardType="numeric"
                            placeholder="Qty"
                            value={qty[inv.commodity_id] ?? ""}
                            onChangeText={(t) =>
                              setQty((s) => ({ ...s, [inv.commodity_id]: t }))
                            }
                          />
                          <Button
                            size="sm"
                            label="Lock"
                            loading={
                              claim.isPending &&
                              claim.variables?.commodity_id === inv.commodity_id
                            }
                            onPress={() => {
                              const q = Number(qty[inv.commodity_id]);
                              if (!q || q <= 0) {
                                Alert.alert("Enter a quantity to lock.");
                                return;
                              }
                              claim.mutate({
                                location_id: loc.id,
                                commodity_id: inv.commodity_id,
                                quantity: q,
                              });
                            }}
                          />
                        </View>
                      </View>
                    ))
                  )}
                </View>
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
