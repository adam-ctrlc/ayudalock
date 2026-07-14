import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import type { Allocation, AllocationStatus } from "@/lib/api/allocations";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatExpiry(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

type BadgeVariant =
  | "default"
  | "secondary"
  | "accent"
  | "destructive"
  | "success"
  | "muted";

const STATUS: Record<AllocationStatus, { label: string; variant: BadgeVariant }> = {
  locked: { label: "Ready to claim", variant: "success" },
  redeemed: { label: "Redeemed", variant: "muted" },
  expired: { label: "Expired", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "muted" },
};

export function VoucherCard({
  allocation,
  onRelease,
  releasing,
}: {
  allocation: Allocation;
  onRelease?: () => void;
  releasing?: boolean;
}) {
  const status = STATUS[allocation.status];
  const voucher = allocation.voucher;
  const validUntil = formatExpiry(allocation.expires_at);

  return (
    <Card className="gap-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text variant="heading">
            {allocation.commodity?.name ?? "Allocation"}
          </Text>
          <Text variant="caption">{allocation.program?.name}</Text>
        </View>
        <Badge variant={status.variant} label={status.label} />
      </View>

      <View className="flex-row justify-between">
        <View>
          <Text variant="caption">Quantity</Text>
          <Text variant="label">
            {allocation.quantity} {allocation.commodity?.unit}
          </Text>
        </View>
        <View className="items-end">
          <Text variant="caption">Location</Text>
          <Text variant="label">{allocation.location?.name}</Text>
        </View>
      </View>

      {allocation.status === "locked" && voucher ? (
        <View className="items-center gap-3 rounded-xl bg-secondary p-4">
          <QRCode value={voucher.qr_payload} size={168} />
          <View className="items-center">
            <Text variant="caption">SMS code</Text>
            <Text className="text-2xl font-bold tracking-[8px] text-primary">
              {voucher.sms_code}
            </Text>
          </View>
          {validUntil ? (
            <Text variant="caption">Valid until {validUntil}</Text>
          ) : null}
          <Text variant="caption" className="text-center">
            Show this QR or code to the merchant to claim your goods.
          </Text>
        </View>
      ) : null}

      {allocation.status === "locked" && onRelease ? (
        <Button
          variant="outline"
          label="Release allocation"
          onPress={onRelease}
          loading={releasing}
        />
      ) : null}
    </Card>
  );
}
