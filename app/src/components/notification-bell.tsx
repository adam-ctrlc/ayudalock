import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { Bell } from "phosphor-react-native";

import { useUnreadCount } from "@/lib/queries/notifications";
import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";

export function NotificationBell() {
  const unread = useUnreadCount();
  return (
    <Link href="/notifications" asChild>
      <Pressable hitSlop={8} className="active:opacity-60">
        <View>
          <Bell size={26} color={PH_COLORS.foreground} weight="regular" />
          {unread > 0 ? (
            <View className="absolute -right-1.5 -top-1.5 h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1">
              <Text className="text-[10px] font-bold text-destructive-foreground">
                {unread > 9 ? "9+" : unread}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}
