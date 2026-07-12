import { View } from "react-native";
import { Ticket } from "phosphor-react-native";

import {
  useAllocations,
  useReleaseAllocation,
} from "@/lib/queries/allocations";
import { PH_COLORS } from "@/lib/theme";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { SkeletonCard } from "@/components/ui/skeleton";
import { VoucherCard } from "@/components/voucher-card";

export function MyVouchers() {
  const allocations = useAllocations();
  const release = useReleaseAllocation();

  const active = (allocations.data ?? []).filter((a) => a.status === "locked");

  if (allocations.isLoading) {
    return (
      <View className="gap-3">
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (allocations.isError) {
    return (
      <Text className="text-destructive">Couldn&apos;t load your vouchers.</Text>
    );
  }

  if (active.length === 0) {
    return (
      <Card className="items-center gap-2 py-6">
        <Ticket size={28} color={PH_COLORS.mutedForeground} weight="duotone" />
        <Text variant="caption" className="text-center">
          No active vouchers. Reserve goods from the Available tab.
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      {active.map((a) => (
        <VoucherCard
          key={a.id}
          allocation={a}
          onRelease={() => release.mutate(a.id)}
          releasing={release.isPending && release.variables === a.id}
        />
      ))}
    </View>
  );
}
