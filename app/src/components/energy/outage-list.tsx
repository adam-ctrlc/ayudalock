import { View } from "react-native";

import { useInterruptions } from "@/lib/queries/energy";
import type { InterruptionType } from "@/lib/api/energy";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { interruptionWindow } from "@/components/energy/energy-labels";

function typeVariant(type: InterruptionType) {
  switch (type) {
    case "emergency":
    case "unplanned":
      return "destructive" as const;
    case "rotating":
      return "accent" as const;
    default:
      return "muted" as const;
  }
}

export function OutageList({
  province,
  limit = 8,
}: {
  province?: string;
  limit?: number;
}) {
  const interruptions = useInterruptions(province ? { province } : {});

  if (interruptions.isLoading) {
    return (
      <View className="gap-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </View>
    );
  }

  const items = (interruptions.data ?? []).slice(0, limit);

  if (items.length === 0) {
    return (
      <Card>
        <Text variant="caption">No power interruptions scheduled.</Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      {items.map((item) => (
        <Card key={item.id} className="gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <Text variant="label" className="flex-1">
              {item.barangay ?? item.province ?? item.utility}
            </Text>
            <Badge
              variant={item.is_active_now ? "destructive" : typeVariant(item.type)}
              label={item.is_active_now ? "ongoing" : item.type_label}
            />
          </View>
          <Text variant="caption">
            {interruptionWindow(item.starts_at, item.ends_at)} · {item.utility}
          </Text>
          {item.households_affected ? (
            <Text variant="caption">
              {item.households_affected.toLocaleString()} households affected
            </Text>
          ) : null}
        </Card>
      ))}
    </View>
  );
}
