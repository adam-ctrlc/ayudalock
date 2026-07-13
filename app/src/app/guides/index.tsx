import { View } from "react-native";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { BackBar } from "@/components/back-bar";
import { GuideList } from "@/components/guide-list";

export default function GuidesScreen() {
  return (
    <Screen edges={["top"]}>
      <BackBar />
      <View className="gap-0.5">
        <Text variant="title">Gabay</Text>
        <Text variant="subtitle">
          Know the requirements and where to apply.
        </Text>
      </View>
      <GuideList />
    </Screen>
  );
}
