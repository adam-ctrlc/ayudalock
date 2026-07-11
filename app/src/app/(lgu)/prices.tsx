import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import {
  createPrice,
  listPrices,
  updatePrice,
  type PriceCategory,
} from "@/lib/api/prices";
import { cn } from "@/lib/utils";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { key: PriceCategory; label: string }[] = [
  { key: "fuel", label: "Fuel" },
  { key: "fare", label: "Fare" },
  { key: "commodity", label: "Market" },
];

export default function LguPrices() {
  const qc = useQueryClient();
  const prices = useQuery({
    queryKey: ["prices", "manage"],
    queryFn: () => listPrices(),
  });

  const [category, setCategory] = useState<PriceCategory>("fuel");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("per liter");
  const [edits, setEdits] = useState<Record<number, string>>({});

  const invalidate = () => qc.invalidateQueries({ queryKey: ["prices"] });

  const create = useMutation({
    mutationFn: () =>
      createPrice({ category, name, value: Number(value), unit }),
    onSuccess: () => {
      invalidate();
      setName("");
      setValue("");
      Alert.alert("Added", "The new price is now live.");
    },
    onError: (e) =>
      Alert.alert(
        "Could not add",
        e instanceof ApiError ? e.message : "Please try again.",
      ),
  });

  const update = useMutation({
    mutationFn: (args: { id: number; value: number }) =>
      updatePrice(args.id, { value: args.value }),
    onSuccess: (_data, args) => {
      invalidate();
      setEdits((s) => {
        const next = { ...s };
        delete next[args.id];
        return next;
      });
    },
    onError: (e) =>
      Alert.alert(
        "Could not update",
        e instanceof ApiError ? e.message : "Please try again.",
      ),
  });

  return (
    <Screen
      edges={[]}
      refreshing={prices.isRefetching}
      onRefresh={() => prices.refetch()}
    >
      <Text variant="title">Manage prices</Text>

      <Card>
        <CardHeader>
          <CardTitle>Add a price</CardTitle>
        </CardHeader>
        <View className="gap-3">
          <View className="flex-row gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  className={cn(
                    "flex-1 items-center rounded-xl border py-2.5",
                    active
                      ? "border-primary bg-primary"
                      : "border-border bg-background",
                  )}
                >
                  <Text
                    className={cn(
                      "font-semibold",
                      active ? "text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Field label="Name">
            <Input value={name} onChangeText={setName} placeholder="Diesel" />
          </Field>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Field label="Value (PHP)">
                <Input
                  value={value}
                  onChangeText={setValue}
                  keyboardType="numeric"
                  placeholder="60.00"
                />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="Unit">
                <Input value={unit} onChangeText={setUnit} placeholder="per liter" />
              </Field>
            </View>
          </View>
          <Button
            label="Add price"
            loading={create.isPending}
            onPress={() => {
              if (!name.trim() || !Number(value)) {
                Alert.alert("Enter a name and a value.");
                return;
              }
              create.mutate();
            }}
          />
        </View>
      </Card>

      <View className="gap-2">
        <Text variant="heading">Current prices</Text>
        {prices.isLoading ? (
          <View className="gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </View>
        ) : (
          prices.data?.map((p) => (
            <Card key={p.id} className="gap-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text variant="label">{p.name}</Text>
                  <Text variant="caption">
                    {p.category} · {p.unit}
                  </Text>
                </View>
                <Text className="text-lg font-bold">₱{p.value.toFixed(2)}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Input
                  className="flex-1"
                  keyboardType="numeric"
                  placeholder="New value"
                  value={edits[p.id] ?? ""}
                  onChangeText={(t) =>
                    setEdits((s) => ({ ...s, [p.id]: t }))
                  }
                />
                <Button
                  size="sm"
                  variant="secondary"
                  label="Update"
                  loading={update.isPending && update.variables?.id === p.id}
                  onPress={() => {
                    const v = Number(edits[p.id]);
                    if (!v || v <= 0) {
                      Alert.alert("Enter a new value.");
                      return;
                    }
                    update.mutate({ id: p.id, value: v });
                  }}
                />
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}
