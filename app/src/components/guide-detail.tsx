import { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import {
  CheckCircle,
  Info,
  Link as LinkIcon,
  MapPin,
} from "phosphor-react-native";

import { useGuide } from "@/lib/queries/guides";
import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GUIDE_CATEGORY_LABEL, GuideIcon } from "@/components/guide-indicators";

function SectionTitle({ children }: { children: string }) {
  return <Text variant="heading">{children}</Text>;
}

export function GuideDetail({ id }: { id: number }) {
  const query = useGuide(id);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  if (query.isLoading) {
    return (
      <View className="gap-4">
        <Skeleton className="h-8 w-3/4 rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </View>
    );
  }

  if (query.isError || !query.data) {
    return <Text className="text-destructive">Couldn&apos;t load this guide.</Text>;
  }

  const guide = query.data;

  return (
    <View className="gap-4">
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <GuideIcon category={guide.category} size={22} />
          </View>
          <View className="flex-row items-center gap-2">
            <Badge variant="secondary" label={guide.agency} />
            <Text variant="caption">
              {GUIDE_CATEGORY_LABEL[guide.category]}
            </Text>
          </View>
        </View>
        <Text variant="title">{guide.title}</Text>
        <Text className="text-sm leading-5 text-foreground">
          {guide.summary}
        </Text>
      </View>

      <SectionTitle>What to prepare</SectionTitle>
      <Card className="gap-1">
        {guide.requirements.map((req, i) => {
          const isChecked = checked.has(i);
          return (
            <Pressable
              key={i}
              onPress={() => toggle(i)}
              className="flex-row items-start gap-3 py-2 active:opacity-70"
            >
              {isChecked ? (
                <CheckCircle size={22} color={PH_COLORS.success} weight="fill" />
              ) : (
                <View className="h-[22px] w-[22px] rounded-full border-2 border-muted-foreground" />
              )}
              <Text
                className={
                  isChecked
                    ? "flex-1 text-base text-muted-foreground line-through"
                    : "flex-1 text-base text-foreground"
                }
              >
                {req}
              </Text>
            </Pressable>
          );
        })}
      </Card>

      <SectionTitle>How to do it</SectionTitle>
      <Card className="gap-3">
        {guide.steps.map((step, i) => (
          <View key={i} className="flex-row items-start gap-3">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
              <Text className="text-xs font-bold text-primary-foreground">
                {i + 1}
              </Text>
            </View>
            <Text className="flex-1 text-base leading-5 text-foreground">
              {step}
            </Text>
          </View>
        ))}
      </Card>

      <SectionTitle>Where to go</SectionTitle>
      <Card className="gap-3">
        <View className="flex-row items-start gap-3">
          <MapPin size={20} color={PH_COLORS.blue} weight="duotone" />
          <Text className="flex-1 text-base leading-5 text-foreground">
            {guide.where_to_go}
          </Text>
        </View>
        {guide.fees ? (
          <View className="flex-row items-center justify-between border-t border-border pt-3">
            <Text variant="caption">Fees</Text>
            <Text variant="label">{guide.fees}</Text>
          </View>
        ) : null}
      </Card>

      {guide.notes ? (
        <Card className="flex-row items-start gap-3 border-accent bg-secondary">
          <Info size={20} color={PH_COLORS.blue} weight="duotone" />
          <Text className="flex-1 text-sm leading-5 text-foreground">
            {guide.notes}
          </Text>
        </Card>
      ) : null}

      <View className="gap-2">
        <Text variant="caption">
          Guide updated {guide.effective_date ?? guide.updated_at ?? "recently"}.
          Requirements can change, please confirm with the office before going.
        </Text>
        {guide.source_url ? (
          <Pressable
            onPress={() => Linking.openURL(guide.source_url as string)}
            className="flex-row items-center gap-2 active:opacity-60"
          >
            <LinkIcon size={16} color={PH_COLORS.blue} />
            <Text className="text-sm font-medium text-primary">
              Open the official website
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
