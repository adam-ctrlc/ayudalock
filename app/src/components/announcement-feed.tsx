import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { MagnifyingGlass } from "phosphor-react-native";

import { ApiError } from "@/lib/api/client";
import type { AnnouncementCategory } from "@/lib/api/announcements";
import {
  useAnnouncements,
  useDeleteAnnouncement,
} from "@/lib/queries/announcements";
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { useDialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { IconInput } from "@/components/ui/icon-input";
import { AnnouncementCard } from "@/components/announcement-card";

const CATEGORIES: { key: AnnouncementCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "relief", label: "Relief" },
  { key: "advisory", label: "Advisory" },
  { key: "price", label: "Prices" },
  { key: "general", label: "News" },
];

export function AnnouncementFeed({ manage }: { manage?: boolean }) {
  const announcements = useAnnouncements();
  const del = useDeleteAnnouncement();
  const dialog = useDialog();
  const [category, setCategory] = useState<AnnouncementCategory | "all">("all");
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    let data = announcements.data ?? [];
    if (category !== "all") {
      data = data.filter((a) => a.category === category);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      data = data.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.body.toLowerCase().includes(term),
      );
    }
    return data;
  }, [announcements.data, category, search]);

  async function confirmDelete(id: number) {
    const ok = await dialog.confirm({
      title: "Remove announcement?",
      message: "This cannot be undone.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    del.mutate(id, {
      onError: (e) =>
        dialog.alert({
          title: "Could not remove",
          message: e instanceof ApiError ? e.message : "Please try again.",
        }),
    });
  }

  return (
    <View className="gap-3">
      <IconInput
        icon={<MagnifyingGlass size={20} color={PH_COLORS.mutedForeground} />}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Search announcements"
      />

      <View className="flex-row flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCategory(c.key)}
              className={cn(
                "rounded-full px-3 py-1.5",
                active ? "bg-primary" : "bg-muted",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  active ? "text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {announcements.isLoading ? (
        <View className="gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </View>
      ) : announcements.isError ? (
        <Text className="text-destructive">
          Couldn&apos;t load announcements.
        </Text>
      ) : items.length === 0 ? (
        <Card>
          <Text variant="caption">No announcements match your search.</Text>
        </Card>
      ) : (
        items.map((a) => (
          <AnnouncementCard
            key={a.id}
            announcement={a}
            onDelete={manage ? () => confirmDelete(a.id) : undefined}
          />
        ))
      )}
    </View>
  );
}
