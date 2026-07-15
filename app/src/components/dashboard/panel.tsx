import { View } from "react-native";

import { Text } from "@/components/ui/text";

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-2">
        <Text variant="heading">{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}
