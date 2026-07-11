import { Tabs } from "expo-router";
import { ChartBar, Tag, User } from "phosphor-react-native";

import { RoleGate } from "@/components/role-gate";
import { PH_COLORS } from "@/lib/theme";

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
            tabBarIcon: ({ color, size }) => (
              <ChartBar color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="prices"
          options={{
            title: "Prices",
            tabBarIcon: ({ color, size }) => <Tag color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>
    </RoleGate>
  );
}
