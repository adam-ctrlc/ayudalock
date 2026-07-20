import { useState } from "react";
import { Pressable, View } from "react-native";

import { useIncidentReports } from "@/lib/queries/incident-reports";
import { cn } from "@/lib/utils";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { RoleGate } from "@/components/role-gate";
import { BackBar } from "@/components/back-bar";
import { IncidentReportForm } from "@/components/incident-report-form";
import { MyReportsList } from "@/components/my-reports-list";

type Section = "new" | "mine";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "new", label: "New report" },
  { key: "mine", label: "My reports" },
];

export default function Report() {
  const [section, setSection] = useState<Section>("new");
  const reports = useIncidentReports();

  return (
    <RoleGate role="citizen">
      <Screen
        edges={["top"]}
        refreshing={reports.isRefetching}
        onRefresh={() => reports.refetch()}
      >
        <BackBar />

        <View className="gap-0.5">
          <Text variant="title">Report an incident</Text>
        </View>

        <View className="flex-row gap-2">
          {SECTIONS.map((s) => {
            const active = section === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSection(s.key)}
                className={cn(
                  "flex-1 items-center rounded-xl border py-2.5",
                  active
                    ? "border-primary bg-primary"
                    : "border-border bg-background",
                )}
              >
                <Text
                  className={cn(
                    "text-sm font-semibold",
                    active ? "text-primary-foreground" : "text-foreground",
                  )}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {section === "new" ? <IncidentReportForm /> : <MyReportsList />}
      </Screen>
    </RoleGate>
  );
}
