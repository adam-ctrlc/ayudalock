import { useState } from "react";
import { Pressable, View } from "react-native";

import { ApiError } from "@/lib/api/client";
import type { Redemption } from "@/lib/api/redemptions";
import { useRedeem } from "@/lib/queries/redemptions";
import { cn } from "@/lib/utils";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Mode = "sms" | "token";

export default function MerchantRedeem() {
  const [mode, setMode] = useState<Mode>("sms");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Redemption | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useRedeem();

  return (
    <Screen edges={[]}>
      <View className="gap-1">
        <Text variant="title">Redeem voucher</Text>
        <Text variant="subtitle">Scan or enter the citizen&apos;s code.</Text>
      </View>

      <View className="flex-row gap-2">
        {(["sms", "token"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              className={cn(
                "flex-1 items-center rounded-xl border py-3",
                active ? "border-primary bg-primary" : "border-border bg-background",
              )}
            >
              <Text
                className={cn(
                  "font-semibold",
                  active ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {m === "sms" ? "SMS code" : "QR token"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Field label={mode === "sms" ? "6-digit SMS code" : "Voucher token"}>
        <Input
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          keyboardType={mode === "sms" ? "number-pad" : "default"}
          placeholder={mode === "sms" ? "123456" : "Paste voucher token"}
        />
      </Field>

      {error ? <Text className="text-destructive">{error}</Text> : null}

      <Button
        label="Redeem"
        loading={mutation.isPending}
        onPress={() => {
          if (!value.trim()) {
            setError("Enter a code first.");
            return;
          }
          mutation.mutate(
            mode === "token"
              ? { token: value.trim() }
              : { sms_code: value.trim() },
            {
              onSuccess: (r) => {
                setResult(r);
                setError(null);
                setValue("");
              },
              onError: (e) => {
                setError(
                  e instanceof ApiError ? e.message : "Redemption failed.",
                );
                setResult(null);
              },
            },
          );
        }}
      />

      {result ? (
        <Card className="gap-2 border-success">
          <View className="flex-row items-center justify-between">
            <Text variant="heading">Redeemed</Text>
            <Badge variant="success" label={result.source} />
          </View>
          <Text variant="label">Quantity released: {result.quantity}</Text>
          <Text variant="caption">Hand over the goods to the citizen.</Text>
        </Card>
      ) : null}
    </Screen>
  );
}
