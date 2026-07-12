import { Pressable, View } from "react-native";
import { Link } from "expo-router";

import type {
  Announcement,
  AnnouncementCategory,
} from "@/lib/api/announcements";
import { useAnnouncements } from "@/lib/queries/announcements";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type BadgeVariant = "success" | "destructive" | "accent" | "secondary";

const CATEGORY: Record<
  AnnouncementCategory,
  { label: string; variant: BadgeVariant }
> = {
  relief: { label: "Relief", variant: "success" },
  advisory: { label: "Advisory", variant: "destructive" },
  price: { label: "Prices", variant: "accent" },
  general: { label: "News", variant: "secondary" },
};

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AlertRow({ item }: { item: Announcement }) {
  const cat = CATEGORY[item.category];
  return (
    <Card className="gap-1.5">
      <View className="flex-row items-center justify-between gap-2">
        <Badge variant={cat.variant} label={cat.label} />
        <Text variant="caption">{timeAgo(item.created_at)}</Text>
      </View>
      <Text variant="label" numberOfLines={1}>
        {item.title}
      </Text>
      <Text variant="caption" numberOfLines={2}>
        {item.body}
      </Text>
    </Card>
  );
}

export function LatestAlerts() {
  const query = useAnnouncements();
  const items = (query.data ?? []).slice(0, 2);

  if (!query.isLoading && items.length === 0) return null;

  return (
    <>
      <View className="flex-row items-center justify-between">
        <Text variant="heading">Latest alerts</Text>
        <Link href="/(citizen)/announcements" asChild>
          <Pressable hitSlop={8} className="active:opacity-60">
            <Text variant="caption" className="font-medium text-primary">
              See all
            </Text>
          </Pressable>
        </Link>
      </View>

      {query.isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </View>
      ) : (
        <Link href="/(citizen)/announcements" asChild>
          <Pressable className="gap-3 active:opacity-90">
            {items.map((item) => (
              <AlertRow key={item.id} item={item} />
            ))}
          </Pressable>
        </Link>
      )}
    </>
  );
}
