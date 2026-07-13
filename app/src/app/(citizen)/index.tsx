import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { Link, type Href } from "expo-router";
import { Basket, BookOpen, CaretRight, SealCheck, Tag } from "phosphor-react-native";

import { useEligibility } from "@/lib/queries/eligibility";
import { useAuth } from "@/lib/auth/context";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketSnapshot } from "@/components/market-snapshot";
import { LatestAlerts } from "@/components/latest-alerts";

function QuickAction({
  href,
  icon,
  title,
  subtitle,
}: {
  href: Href;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable className="flex-1 active:opacity-80">
        <Card className="gap-2">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            {icon}
          </View>
          <Text variant="label">{title}</Text>
          <Text variant="caption">{subtitle}</Text>
        </Card>
      </Pressable>
    </Link>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Magandang umaga,";
  if (hour < 18) return "Magandang hapon,";
  return "Magandang gabi,";
}

export default function CitizenHome() {
  const { user } = useAuth();
  const firstName =
    user?.first_name?.trim() || user?.name?.split(" ")[0] || "Kabayan";
  const eligibility = useEligibility();

  const refreshing = eligibility.isRefetching;
  const onRefresh = useCallback(() => {
    eligibility.refetch();
  }, [eligibility]);

  return (
    <Screen edges={["top"]} refreshing={refreshing} onRefresh={onRefresh}>
      <View className="gap-1">
        <Text variant="subtitle">{greeting()}</Text>
        <Text variant="title">{firstName}!</Text>
        <Text variant="caption">
          Maligayang pagdating. Narito ang AyudaLock para tumulong sa iyong
          ayuda at mga serbisyo.
        </Text>
      </View>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <SealCheck size={22} color={PH_COLORS.success} weight="fill" />
          <Text variant="heading">Your eligibility</Text>
        </View>
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
      </Card>

      <Text variant="heading">Quick actions</Text>
      <View className="flex-row gap-3">
        <QuickAction
          href="/(citizen)/locations"
          title="Claim relief"
          subtitle="Reserve food or fuel"
          icon={<Basket size={22} color={PH_COLORS.blue} weight="duotone" />}
        />
        <QuickAction
          href="/(citizen)/prices"
          title="Price Watch"
          subtitle="Fuel, fare, market"
          icon={<Tag size={22} color={PH_COLORS.blue} weight="duotone" />}
        />
      </View>

      <Link href="/guides" asChild>
        <Pressable className="active:opacity-80">
          <Card className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
              <BookOpen size={22} color={PH_COLORS.blue} weight="duotone" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="label">Gabay sa Requirements</Text>
              <Text variant="caption">
                IDs, benefits, and documents: what to prepare and where to go
              </Text>
            </View>
            <CaretRight size={18} color={PH_COLORS.mutedForeground} />
          </Card>
        </Pressable>
      </Link>

      <MarketSnapshot />

      <LatestAlerts />
    </Screen>
  );
}
