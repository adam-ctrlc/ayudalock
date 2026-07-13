import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Trash } from "phosphor-react-native";

import { ApiError } from "@/lib/api/client";
import type { GuideCategory } from "@/lib/api/guides";
import {
  useCreateGuide,
  useDeleteGuide,
  useGuides,
} from "@/lib/queries/guides";
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GUIDE_CATEGORY_LABEL, GuideIcon } from "@/components/guide-indicators";

const CATEGORIES: GuideCategory[] = [
  "id",
  "benefit",
  "document",
  "relief",
  "tax",
  "work",
  "business",
  "travel",
];

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function GuidesAdmin() {
  const guides = useGuides();
  const create = useCreateGuide();
  const remove = useDeleteGuide();

  const [category, setCategory] = useState<GuideCategory>("id");
  const [agency, setAgency] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [requirements, setRequirements] = useState("");
  const [steps, setSteps] = useState("");
  const [whereToGo, setWhereToGo] = useState("");
  const [fees, setFees] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setCategory("id");
    setAgency("");
    setTitle("");
    setSummary("");
    setRequirements("");
    setSteps("");
    setWhereToGo("");
    setFees("");
    setSourceUrl("");
    setNotes("");
  }

  function post() {
    const reqs = lines(requirements);
    const stepList = lines(steps);
    if (!agency.trim() || !title.trim() || !summary.trim()) {
      Alert.alert("Add an agency, title, and summary first.");
      return;
    }
    if (reqs.length === 0 || stepList.length === 0 || !whereToGo.trim()) {
      Alert.alert("Add at least one requirement, one step, and where to go.");
      return;
    }
    create.mutate(
      {
        category,
        agency: agency.trim(),
        title: title.trim(),
        summary: summary.trim(),
        requirements: reqs,
        steps: stepList,
        where_to_go: whereToGo.trim(),
        fees: fees.trim() || null,
        source_url: sourceUrl.trim() || null,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          reset();
          Alert.alert("Published", "Citizens can now see this guide.");
        },
        onError: (e) =>
          Alert.alert(
            "Could not publish",
            e instanceof ApiError ? e.message : "Please try again.",
          ),
      },
    );
  }

  function confirmDelete(id: number, guideTitle: string) {
    Alert.alert("Remove guide?", `"${guideTitle}" will be hidden from citizens.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => remove.mutate(id),
      },
    ]);
  }

  return (
    <Screen
      edges={["top"]}
      refreshing={guides.isRefetching}
      onRefresh={() => guides.refetch()}
    >
      <View className="gap-0.5">
        <Text variant="title">Gabay</Text>
        <Text variant="subtitle">
          Publish requirement guides for citizens.
        </Text>
      </View>

      <Card>
        <CardHeader>
          <CardTitle>New guide</CardTitle>
        </CardHeader>
        <View className="gap-3">
          <Field label="Category">
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  className={cn(
                    "rounded-full px-3 py-1.5",
                    category === c ? "bg-primary" : "bg-muted",
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium",
                      category === c
                        ? "text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {GUIDE_CATEGORY_LABEL[c]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Agency">
            <Input
              value={agency}
              onChangeText={setAgency}
              placeholder="SSS, PhilHealth, PSA, LGU..."
            />
          </Field>
          <Field label="Title">
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="Get an SSS number and UMID card"
            />
          </Field>
          <Field label="Short summary">
            <Input
              value={summary}
              onChangeText={setSummary}
              multiline
              className="h-20 py-3"
              style={{ textAlignVertical: "top" }}
              placeholder="One or two sentences on what this is for"
            />
          </Field>
          <Field label="Requirements (one per line)">
            <Input
              value={requirements}
              onChangeText={setRequirements}
              multiline
              className="h-28 py-3"
              style={{ textAlignVertical: "top" }}
              placeholder={"PSA birth certificate\nOne valid government ID"}
            />
          </Field>
          <Field label="Steps (one per line)">
            <Input
              value={steps}
              onChangeText={setSteps}
              multiline
              className="h-28 py-3"
              style={{ textAlignVertical: "top" }}
              placeholder={"Register online\nBook an appointment"}
            />
          </Field>
          <Field label="Where to go">
            <Input
              value={whereToGo}
              onChangeText={setWhereToGo}
              multiline
              className="h-20 py-3"
              style={{ textAlignVertical: "top" }}
              placeholder="Any SSS branch, or online at sss.gov.ph"
            />
          </Field>
          <Field label="Fees (optional)">
            <Input value={fees} onChangeText={setFees} placeholder="Free" />
          </Field>
          <Field label="Official website (optional)">
            <Input
              value={sourceUrl}
              onChangeText={setSourceUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="https://www.sss.gov.ph"
            />
          </Field>
          <Field label="Notes (optional)">
            <Input
              value={notes}
              onChangeText={setNotes}
              multiline
              className="h-20 py-3"
              style={{ textAlignVertical: "top" }}
              placeholder="Bring originals and photocopies"
            />
          </Field>

          <Button
            label="Publish guide"
            loading={create.isPending}
            onPress={post}
          />
        </View>
      </Card>

      <Text variant="heading">Published guides</Text>
      {guides.isLoading ? (
        <View className="gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </View>
      ) : (guides.data ?? []).length === 0 ? (
        <Card>
          <Text variant="caption">No guides yet.</Text>
        </Card>
      ) : (
        <View className="gap-3">
          {guides.data?.map((guide) => (
            <Card key={guide.id} className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <GuideIcon category={guide.category} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text variant="label" numberOfLines={1}>
                  {guide.title}
                </Text>
                <Badge variant="secondary" label={guide.agency} />
              </View>
              <Pressable
                onPress={() => confirmDelete(guide.id, guide.title)}
                hitSlop={8}
                className="active:opacity-60"
              >
                <Trash size={20} color={PH_COLORS.red} />
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
