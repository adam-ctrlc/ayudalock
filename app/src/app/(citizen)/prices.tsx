import { View } from "react-native";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { PriceList } from "@/components/price-list";

export default function CitizenPrices() {
  return (
    <Screen edges={["top"]}>
      <View className="gap-0.5">
        <Text variant="title">Price Watch</Text>
        <Text variant="subtitle">
          Track fuel, fare, and market prices near you.
        </Text>
      </View>
      <PriceList />
    </Screen>
  );
}
