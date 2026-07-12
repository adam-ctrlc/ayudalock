import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

import type { BatchItem, BatchResult } from "@/lib/api/redemptions";
import { useOfflineSync } from "@/lib/queries/redemptions";
import { uuidv4 } from "@/lib/uuid";
import { cn } from "@/lib/utils";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Mode = "sms" | "token";

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

export default function MerchantOffline() {
  const [mode, setMode] = useState<Mode>("sms");
  const [value, setValue] = useState("");
  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);

  const sync = useOfflineSync();

  function add() {
    const v = value.trim();
    if (!v) return;
    setQueue((q) => [
      ...q,
      {
        client_uuid: uuidv4(),
        redeemed_at: new Date().toISOString(),
        ...(mode === "token" ? { token: v } : { sms_code: v }),
      },
    ]);
    setValue("");
  }

  return (
    <Screen edges={["top"]}>
      <View className="gap-1">
        <Text variant="title">Offline queue</Text>
        <Text variant="subtitle">
          Capture redemptions during a brownout, then sync when back online.
        </Text>
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

      <View className="flex-row gap-2">
        <Input
          className="flex-1"
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          keyboardType={mode === "sms" ? "number-pad" : "default"}
          placeholder={mode === "sms" ? "SMS code" : "Voucher token"}
        />
        <Button variant="secondary" label="Add" onPress={add} />
      </View>

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
              <Text variant="label">
                {it.sms_code ?? `${it.token?.slice(0, 16)}...`}
              </Text>
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
          sync.mutate(queue, {
            onSuccess: (res) => {
              setResults(res);
              setQueue([]);
            },
            onError: () =>
              Alert.alert(
                "Sync failed",
                "Check your connection and try again.",
              ),
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
