import { useLocalSearchParams } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { BackBar } from "@/components/back-bar";
import { GuideDetail } from "@/components/guide-detail";

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen edges={["top"]}>
      <BackBar label="All guides" />
      <GuideDetail id={Number(id)} />
    </Screen>
  );
}
