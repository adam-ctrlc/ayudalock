import { Redirect } from "expo-router";
import { View } from "react-native";

import type { UserRole } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/context";
import { Skeleton } from "@/components/ui/skeleton";

export function RoleGate({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <View className="flex-1 gap-3 bg-background p-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </View>
    );
  }

  if (status === "guest" || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== role) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}
