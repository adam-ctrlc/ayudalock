import { ScrollView, View, RefreshControl } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";

export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  edges = ["top"],
  className,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
  className?: string;
}) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn("gap-4 p-4", className)}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={PH_COLORS.blue}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn("flex-1 gap-4 p-4", className)}>{children}</View>
      )}
    </SafeAreaView>
  );
}
