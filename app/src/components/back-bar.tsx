import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";

import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";

export function BackBar({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      className="flex-row items-center gap-1 self-start active:opacity-60"
    >
      <CaretLeft size={20} color={PH_COLORS.blue} weight="bold" />
      <Text className="text-base font-medium text-primary">{label}</Text>
    </Pressable>
  );
}
