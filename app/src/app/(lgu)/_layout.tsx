import { Tabs } from "expo-router";
import { BookOpen, ChartBar, Megaphone, Tag, User } from "phosphor-react-native";

import { RoleGate } from "@/components/role-gate";
import { PH_COLORS } from "@/lib/theme";

function tabColor(focused: boolean) {
  return focused ? PH_COLORS.blue : PH_COLORS.mutedForeground;
}

export default function LguLayout() {
  return (
    <RoleGate role="lgu_admin">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: PH_COLORS.blue,
          tabBarInactiveTintColor: PH_COLORS.mutedForeground,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: "Dashboard",
            tabBarIcon: ({ focused, size }) => (
              <ChartBar color={tabColor(focused)} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="announcements"
          options={{
            tabBarLabel: "Alerts",
            tabBarIcon: ({ focused, size }) => (
              <Megaphone color={tabColor(focused)} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="prices"
          options={{
            tabBarLabel: "Prices",
            tabBarIcon: ({ focused, size }) => (
              <Tag color={tabColor(focused)} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="guides"
          options={{
            tabBarLabel: "Gabay",
            tabBarIcon: ({ focused, size }) => (
              <BookOpen color={tabColor(focused)} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            tabBarLabel: "Account",
            tabBarIcon: ({ focused, size }) => (
              <User color={tabColor(focused)} size={size} />
            ),
          }}
        />
      </Tabs>
    </RoleGate>
  );
}
