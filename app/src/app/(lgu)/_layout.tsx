import { Tabs } from "expo-router";
import { ChartBar, Tag, User } from "phosphor-react-native";

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
          headerStyle: { backgroundColor: PH_COLORS.blue },
          headerTintColor: PH_COLORS.white,
          tabBarActiveTintColor: PH_COLORS.blue,
          tabBarInactiveTintColor: PH_COLORS.mutedForeground,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ focused, size }) => (
              <ChartBar color={tabColor(focused)} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="prices"
          options={{
            title: "Prices",
            tabBarIcon: ({ focused, size }) => (
              <Tag color={tabColor(focused)} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ focused, size }) => (
              <User color={tabColor(focused)} size={size} />
            ),
          }}
        />
      </Tabs>
    </RoleGate>
  );
}
