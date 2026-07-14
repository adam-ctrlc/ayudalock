import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { ApiError } from "@/lib/api/client";
import type { AnnouncementCategory } from "@/lib/api/announcements";
import {
  useAnnouncements,
  useCreateAnnouncement,
} from "@/lib/queries/announcements";
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useDialog } from "@/components/ui/dialog";
import { AnnouncementFeed } from "@/components/announcement-feed";

const CATEGORIES: { key: AnnouncementCategory; label: string }[] = [
  { key: "general", label: "News" },
  { key: "relief", label: "Relief" },
  { key: "advisory", label: "Advisory" },
  { key: "price", label: "Prices" },
];

export function AnnouncementsAdmin() {
  const announcements = useAnnouncements();
  const create = useCreateAnnouncement();
  const dialog = useDialog();

  const [category, setCategory] = useState<AnnouncementCategory>("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function post() {
    if (!title.trim() || !body.trim()) {
      dialog.alert("Add a title and a message first.");
      return;
    }
    create.mutate(
      { title: title.trim(), body: body.trim(), category },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          setCategory("general");
          dialog.alert({
            title: "Posted",
            message: "Citizens can now see your announcement.",
          });
        },
        onError: (e) =>
          dialog.alert({
            title: "Could not post",
            message: e instanceof ApiError ? e.message : "Please try again.",
          }),
      },
    );
  }

  return (
    <Screen
      edges={["top"]}
      refreshing={announcements.isRefetching}
      onRefresh={() => announcements.refetch()}
    >
      <View className="gap-0.5">
        <Text variant="title">Announcements</Text>
        <Text variant="subtitle">Post updates for citizens to see.</Text>
      </View>

      <Card>
        <CardHeader>
          <CardTitle>Post an announcement</CardTitle>
        </CardHeader>
        <View className="gap-3">
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
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Field label="Title">
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Kadiwa pop-up this Saturday"
            />
          </Field>
          <Field label="Message">
            <TextInput
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
              placeholder="Write the details citizens should know..."
              placeholderTextColor={PH_COLORS.mutedForeground}
              className="min-h-[104px] rounded-xl border border-input bg-background p-3 text-base text-foreground"
            />
          </Field>
          <Button
            label="Post announcement"
            loading={create.isPending}
            onPress={post}
          />
        </View>
      </Card>

      <Text variant="heading">Posted</Text>
      <AnnouncementFeed manage />
    </Screen>
  );
}
