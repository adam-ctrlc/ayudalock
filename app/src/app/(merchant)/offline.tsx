import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";

import type { BatchItem, BatchResult } from "@/lib/api/redemptions";
import { useOfflineSync } from "@/lib/queries/redemptions";
import { useVoucherKey } from "@/lib/queries/voucher-key";
import { tokenFromQrPayload, verifyVoucherToken } from "@/lib/voucher/verify";
import { uuidv4 } from "@/lib/uuid";
import { cn } from "@/lib/utils";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Mode = "scan" | "sms" | "token";
type Tag = "verified" | "expired" | "unverified";

type QueuedItem = BatchItem & { tag: Tag };

const QUEUE_KEY = "ayudalock.offline_queue";

const MODE_LABELS: Record<Mode, string> = {
  scan: "Scan QR",
  sms: "SMS code",
  token: "QR token",
};

const TAG_LABELS: Record<Tag, string> = {
  verified: "signature verified",
  expired: "expired",
  unverified: "unverified",
};

function resultVariant(status: BatchResult["status"]) {
  switch (status) {
    case "accepted":
      return "success" as const;
    case "duplicate":
      return "muted" as const;
    default:
      return "destructive" as const;
  }
}

function tagVariant(tag: Tag) {
  switch (tag) {
    case "verified":
      return "success" as const;
    case "expired":
      return "destructive" as const;
    default:
      return "muted" as const;
  }
}

export default function MerchantOffline() {
  const [mode, setMode] = useState<Mode>("scan");
  const [value, setValue] = useState("");
  const [queue, setQueue] = useState<QueuedItem[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const sync = useOfflineSync();
  const voucherKey = useVoucherKey();
  const dialog = useDialog();

  useEffect(() => {
    AsyncStorage.getItem(QUEUE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setQueue(JSON.parse(raw) as QueuedItem[]);
          } catch {
            // ignore corrupted storage
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, [queue, hydrated]);

  function enqueue(item: BatchItem, tag: Tag) {
    setQueue((q) => [...q, { ...item, tag }]);
  }

  async function addToken(raw: string) {
    const token = tokenFromQrPayload(raw);

    if (token === null) {
      setError("That QR code is not a voucher.");
      return;
    }

    const result = await verifyVoucherToken(token, voucherKey.data ?? null);

    switch (result.status) {
      case "verified":
        enqueue(
          { client_uuid: uuidv4(), redeemed_at: new Date().toISOString(), token },
          "verified",
        );
        setNotice(
          `Signature verified offline. Voucher #${result.payload.aid}, expires ${new Date(result.payload.exp * 1000).toLocaleTimeString()}.`,
        );
        setError(null);
        return;
      case "expired":
        setError(
          `This voucher expired at ${new Date(result.payload.exp * 1000).toLocaleTimeString()}. It cannot be redeemed.`,
        );
        setNotice(null);
        return;
      case "invalid_signature":
        setError("Invalid signature. This voucher was not issued by AyudaLock.");
        setNotice(null);
        return;
      case "malformed":
        setError("That code is not a readable voucher.");
        setNotice(null);
        return;
      case "no_key":
        enqueue(
          { client_uuid: uuidv4(), redeemed_at: new Date().toISOString(), token },
          "unverified",
        );
        setNotice("Queued without verification: no signing key cached yet.");
        setError(null);
        return;
    }
  }

  function addSmsCode(code: string) {
    enqueue(
      { client_uuid: uuidv4(), redeemed_at: new Date().toISOString(), sms_code: code },
      "unverified",
    );
    setNotice("SMS codes are confirmed by the server at sync.");
    setError(null);
  }

  async function onManualAdd() {
    const v = value.trim();

    if (!v) {
      setError("Enter a code first.");
      return;
    }

    switch (mode) {
      case "sms":
        addSmsCode(v);
        break;
      default:
        await addToken(v);
        break;
    }

    setValue("");
  }

  async function onScan(data: string) {
    if (scanned) return;
    setScanned(true);
    await addToken(data);
  }

  function toBatchItems(items: QueuedItem[]): BatchItem[] {
    return items.map(({ tag: _tag, ...item }) => item);
  }

  const keyReady = voucherKey.data != null;

  return (
    <Screen edges={["top"]}>
      <View className="gap-1">
        <Text variant="title">Offline queue</Text>
        <Text variant="subtitle">
          Capture redemptions during a brownout, then sync when back online.
        </Text>
      </View>

      <Card className={cn("flex-row items-center justify-between p-3")}>
        <View className="flex-1 pr-2">
          <Text variant="label">Offline verification</Text>
          <Text variant="caption">
            {keyReady
              ? "Signing key cached. QR vouchers verify without a connection."
              : "Connect once to cache the signing key."}
          </Text>
        </View>
        <Badge
          variant={keyReady ? "success" : "muted"}
          label={keyReady ? "ready" : "no key"}
        />
      </Card>

      <View className="flex-row gap-2">
        {(["scan", "sms", "token"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                setScanned(false);
                setError(null);
                setNotice(null);
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
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : !permission.granted ? (
          <Card className="items-center gap-3 py-6">
            <Text variant="caption" className="text-center">
              Camera access is needed to scan voucher QR codes.
            </Text>
            <Button label="Enable camera" onPress={requestPermission} />
          </Card>
        ) : (
          <View className="gap-3">
            <View className="h-64 w-full overflow-hidden rounded-2xl border border-border bg-black">
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : ({ data }) => onScan(data)}
              />
            </View>
            {scanned ? (
              <Button
                variant="outline"
                label="Scan another"
                onPress={() => {
                  setScanned(false);
                  setError(null);
                  setNotice(null);
                }}
              />
            ) : (
              <Text variant="caption" className="text-center">
                Point the camera at the citizen&apos;s voucher QR.
              </Text>
            )}
          </View>
        )
      ) : (
        <View className="flex-row gap-2">
          <Input
            className="flex-1"
            value={value}
            onChangeText={setValue}
            autoCapitalize="none"
            keyboardType={mode === "sms" ? "number-pad" : "default"}
            placeholder={mode === "sms" ? "SMS code" : "Voucher token"}
          />
          <Button variant="secondary" label="Add" onPress={onManualAdd} />
        </View>
      )}

      {notice ? <Text className="text-success">{notice}</Text> : null}
      {error ? <Text className="text-destructive">{error}</Text> : null}

      <View className="gap-2">
        <Text variant="heading">Queued ({queue.length})</Text>
        {queue.length === 0 ? (
          <Text variant="caption">Nothing queued yet.</Text>
        ) : (
          queue.map((it) => (
            <Card
              key={it.client_uuid}
              className="flex-row items-center justify-between p-3"
            >
              <View className="flex-1 pr-2 gap-1">
                <Text variant="label">
                  {it.sms_code ?? `${it.token?.slice(0, 16)}...`}
                </Text>
                <Badge variant={tagVariant(it.tag)} label={TAG_LABELS[it.tag]} />
              </View>
              <Pressable
                onPress={() =>
                  setQueue((q) =>
                    q.filter((x) => x.client_uuid !== it.client_uuid),
                  )
                }
              >
                <Text className="font-medium text-destructive">Remove</Text>
              </Pressable>
            </Card>
          ))
        )}
      </View>

      <Button
        label={`Sync ${queue.length} redemption(s)`}
        loading={sync.isPending}
        disabled={queue.length === 0}
        onPress={() =>
          sync.mutate(toBatchItems(queue), {
            onSuccess: (res) => {
              setResults(res);
              setQueue([]);
            },
            onError: () =>
              dialog.alert({
                title: "Sync failed",
                message: "Check your connection and try again.",
              }),
          })
        }
      />

      {results.length > 0 ? (
        <View className="gap-2">
          <Text variant="heading">Last sync result</Text>
          {results.map((r) => (
            <Card
              key={r.client_uuid}
              className="flex-row items-center justify-between p-3"
            >
              <View className="flex-1 pr-2">
                <Text variant="caption">{r.client_uuid.slice(0, 8)}</Text>
                {r.reason ? (
                  <Text variant="caption" className="text-destructive">
                    {r.reason}
                  </Text>
                ) : null}
              </View>
              <Badge variant={resultVariant(r.status)} label={r.status} />
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
