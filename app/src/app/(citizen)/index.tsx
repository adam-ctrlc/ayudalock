import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { Link, type Href } from "expo-router";
import {
  Basket,
  BellRinging,
  BookOpen,
  CaretRight,
  Megaphone,
  SealCheck,
  Tag,
} from "phosphor-react-native";

import { useEligibility } from "@/lib/queries/eligibility";
import { useClaimReminders } from "@/lib/queries/claim-reminders";
import { useAuth } from "@/lib/auth/context";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketSnapshot } from "@/components/market-snapshot";
import { LatestAlerts } from "@/components/latest-alerts";
import { GridAlertBanner } from "@/components/energy/grid-alert-banner";
import { NotificationBell } from "@/components/notification-bell";

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
  const reminders = useClaimReminders();
  const dueCount = (reminders.data ?? []).filter((r) => r.due).length;

  const refreshing = eligibility.isRefetching;
  const onRefresh = useCallback(() => {
    eligibility.refetch();
  }, [eligibility]);

  return (
    <Screen edges={["top"]} refreshing={refreshing} onRefresh={onRefresh}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text variant="subtitle">{greeting()}</Text>
          <Text variant="title">{firstName}!</Text>
          <Text variant="caption">
            Maligayang pagdating. Narito ang AyudaLock para tumulong sa iyong
            ayuda at mga serbisyo.
          </Text>
        </View>
        <NotificationBell />
      </View>

      <GridAlertBanner />

      {dueCount > 0 ? (
        <Link href="/(citizen)/locations?view=saved" asChild>
          <Pressable className="active:opacity-90">
            <Card className="flex-row items-center gap-3 border-accent">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                <BellRinging size={22} color={PH_COLORS.blue} weight="fill" />
              </View>
              <View className="flex-1">
                <Text variant="label">
                  You have {dueCount} plan{dueCount > 1 ? "s" : ""} to claim
                  today
                </Text>
                <Text variant="caption">Tap to review your saved plans.</Text>
              </View>
              <CaretRight size={18} color={PH_COLORS.mutedForeground} />
            </Card>
          </Pressable>
        </Link>
      ) : null}

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

      <Link href="/report" asChild>
        <Pressable className="active:opacity-80">
          <Card className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
              <Megaphone size={22} color={PH_COLORS.red} weight="duotone" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="label">Report an incident</Text>
              <Text variant="caption">
                Flooding, fire, a blocked road or a downed line near you
              </Text>
            </View>
            <CaretRight size={18} color={PH_COLORS.mutedForeground} />
          </Card>
        </Pressable>
      </Link>

      <Text variant="heading">Quick actions</Text>
      <View className="flex-row gap-3">
        <QuickAction
          href="/(citizen)/locations"
          title="Claim relief"
          subtitle="Reserve food or fuel"
          icon={<Basket size={22} color={PH_COLORS.blue} weight="duotone" />}
        />
        <QuickAction
          href="/(citizen)/locations?view=prices"
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
