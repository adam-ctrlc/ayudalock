import { Redirect } from "expo-router";
import { View } from "react-native";

import { useAuth } from "@/lib/auth/context";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-8">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </View>
    );
  }

  if (status === "guest" || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  switch (user.role) {
    case "merchant":
      return <Redirect href="/(merchant)" />;
    case "lgu_admin":
      return <Redirect href="/(lgu)" />;
    default:
      return <Redirect href="/(citizen)" />;
  }
}
