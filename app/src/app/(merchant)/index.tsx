import { useState } from "react";
import { Pressable, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

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
import { NotificationBell } from "@/components/notification-bell";

type Mode = "scan" | "sms" | "token";

const MODE_LABELS: Record<Mode, string> = {
  scan: "Scan QR",
  sms: "SMS code",
  token: "QR token",
};

function tokenFromScan(data: string) {
  try {
    const parsed = JSON.parse(data) as { token?: unknown };
    if (parsed && typeof parsed.token === "string") return parsed.token;
  } catch {
    // not JSON; treat the raw value as the token
  }
  return data;
}

export default function MerchantRedeem() {
  const [mode, setMode] = useState<Mode>("scan");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Redemption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const mutation = useRedeem();

  function redeem(credential: { token: string } | { sms_code: string }) {
    mutation.mutate(credential, {
      onSuccess: (r) => {
        setResult(r);
        setError(null);
        setValue("");
      },
      onError: (e) => {
        setError(e instanceof ApiError ? e.message : "Redemption failed.");
        setResult(null);
      },
    });
  }

  function onManualRedeem() {
    if (!value.trim()) {
      setError("Enter a code first.");
      return;
    }
    redeem(mode === "token" ? { token: value.trim() } : { sms_code: value.trim() });
  }

  function onScan(data: string) {
    if (scanned || mutation.isPending) return;
    setScanned(true);
    redeem({ token: tokenFromScan(data) });
  }

  function resetScan() {
    setScanned(false);
    setResult(null);
    setError(null);
  }

  return (
    <Screen edges={["top"]}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text variant="title">Redeem voucher</Text>
          <Text variant="subtitle">
            Scan the QR or enter the citizen&apos;s code.
          </Text>
        </View>
        <NotificationBell />
      </View>

      <View className="flex-row gap-2">
        {(["scan", "sms", "token"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                resetScan();
              }}
              className={cn(
                "flex-1 items-center rounded-xl border py-3",
                active ? "border-primary bg-primary" : "border-border bg-background",
              )}
            >
              <Text
                numberOfLines={1}
                className={cn(
                  "font-semibold",
                  active ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {MODE_LABELS[m]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "scan" ? (
        !permission ? (
          <Card>
            <Text variant="caption">Preparing the camera…</Text>
          </Card>
        ) : !permission.granted ? (
          <Card className="items-center gap-3 py-6">
            <Text variant="caption" className="text-center">
              Camera access is needed to scan voucher QR codes.
            </Text>
            <Button label="Enable camera" onPress={requestPermission} />
          </Card>
        ) : (
          <View className="gap-3">
            <View className="h-72 w-full overflow-hidden rounded-2xl border border-border bg-black">
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={
                  scanned || mutation.isPending
                    ? undefined
                    : ({ data }) => onScan(data)
                }
              />
            </View>
            <Text variant="caption" className="text-center">
              {mutation.isPending
                ? "Verifying voucher…"
                : "Point the camera at the citizen's voucher QR."}
            </Text>
            {scanned || result ? (
              <Button variant="outline" label="Scan again" onPress={resetScan} />
            ) : null}
          </View>
        )
      ) : (
        <>
          <Field label={mode === "sms" ? "6-digit SMS code" : "Voucher token"}>
            <Input
              value={value}
              onChangeText={setValue}
              autoCapitalize="none"
              keyboardType={mode === "sms" ? "number-pad" : "default"}
              placeholder={mode === "sms" ? "123456" : "Paste voucher token"}
            />
          </Field>
          <Button
            label="Redeem"
            loading={mutation.isPending}
            onPress={onManualRedeem}
          />
        </>
      )}

      {error ? <Text className="text-destructive">{error}</Text> : null}

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
