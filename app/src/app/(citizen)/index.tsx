import { useCallback } from "react";
import { View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { verifyEligibility } from "@/lib/api/eligibility";
import { cancelAllocation, listAllocations } from "@/lib/api/allocations";
import { useAuth } from "@/lib/auth/context";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { VoucherCard } from "@/components/voucher-card";

export default function CitizenHome() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const eligibility = useQuery({
    queryKey: ["eligibility"],
    queryFn: verifyEligibility,
  });
  const allocations = useQuery({
    queryKey: ["allocations"],
    queryFn: listAllocations,
  });
  const release = useMutation({
    mutationFn: (id: number) => cancelAllocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allocations"] });
      qc.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const refreshing = eligibility.isRefetching || allocations.isRefetching;
  const onRefresh = useCallback(() => {
    eligibility.refetch();
    allocations.refetch();
  }, [eligibility, allocations]);

  return (
    <Screen edges={[]} refreshing={refreshing} onRefresh={onRefresh}>
      <View className="gap-1">
        <Text variant="subtitle">Kumusta,</Text>
        <Text variant="title">{user?.name ?? "Citizen"}</Text>
      </View>

      <Card>
        <CardHeader>
          <CardTitle>Your eligibility</CardTitle>
          <CardDescription>Programs you can claim from.</CardDescription>
        </CardHeader>
        <CardContent>
          {eligibility.isLoading ? (
            <Skeleton className="h-6 w-2/3" />
          ) : eligibility.isError ? (
            <Text className="text-destructive">
              Couldn&apos;t verify eligibility.
            </Text>
          ) : eligibility.data?.eligible ? (
            <View className="flex-row flex-wrap gap-2">
              {eligibility.data.programs.map((p) => (
                <Badge key={p.id} variant="secondary" label={p.name} />
              ))}
            </View>
          ) : (
            <Text variant="caption">
              You are not currently listed for any relief program.
            </Text>
          )}
        </CardContent>
      </Card>

      <View className="gap-2">
        <Text variant="heading">My vouchers</Text>
        {allocations.isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : allocations.isError ? (
          <Text className="text-destructive">
            Couldn&apos;t load your vouchers.
          </Text>
        ) : allocations.data && allocations.data.length > 0 ? (
          allocations.data.map((a) => (
            <VoucherCard
              key={a.id}
              allocation={a}
              onRelease={
                a.status === "locked" ? () => release.mutate(a.id) : undefined
              }
              releasing={release.isPending && release.variables === a.id}
            />
          ))
        ) : (
          <Card>
            <Text variant="caption">
              No vouchers yet. Go to the Claim tab to lock relief goods.
            </Text>
          </Card>
        )}
      </View>
    </Screen>
  );
}
