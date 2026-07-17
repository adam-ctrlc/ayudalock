import { useState } from "react";
import { Pressable, View } from "react-native";

import { useHazards } from "@/lib/queries/hazards";
import { useInterruptions } from "@/lib/queries/energy";
import { cn } from "@/lib/utils";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { HazardsAdmin } from "@/components/hazards-admin";
import { EnergyAdmin } from "@/components/energy-admin";

type Section = "hazards" | "power";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "hazards", label: "Hazards" },
  { key: "power", label: "Power" },
];

export default function Risk() {
  const [section, setSection] = useState<Section>("hazards");
  const hazards = useHazards();
  const interruptions = useInterruptions();

  const active = section === "hazards" ? hazards : interruptions;

  return (
    <Screen
      edges={["top"]}
      refreshing={active.isRefetching}
      onRefresh={() => active.refetch()}
    >
      <View className="gap-0.5">
        <Text variant="title">Risk & Power</Text>
      </View>

      <View className="flex-row gap-2">
        {SECTIONS.map((s) => {
          const isActive = section === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => setSection(s.key)}
              className={cn(
                "flex-1 items-center rounded-xl border py-2.5",
                isActive
                  ? "border-primary bg-primary"
                  : "border-border bg-background",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  isActive ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {section === "hazards" ? <HazardsAdmin /> : <EnergyAdmin />}
    </Screen>
  );
}
