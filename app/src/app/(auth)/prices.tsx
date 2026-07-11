import { View } from "react-native";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { TextLink } from "@/components/ui/text-link";
import { PriceList } from "@/components/price-list";

export default function PublicPrices() {
  return (
    <Screen>
      <View className="mt-6 gap-1">
        <Text variant="title">Price Watch</Text>
        <Text variant="subtitle">
          Current fuel, fare, and market prices across the Philippines.
        </Text>
      </View>
      <PriceList />
      <View className="items-center py-2">
        <TextLink href="/(auth)/login">Back to sign in</TextLink>
      </View>
    </Screen>
  );
}
