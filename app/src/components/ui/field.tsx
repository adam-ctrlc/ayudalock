import { View } from "react-native";

import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1">
      <Label>{label}</Label>
      {children}
      {error ? (
        <Text variant="caption" className="text-destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
