import { Tabs } from "expo-router";
import { CloudArrowUp, QrCode, User } from "phosphor-react-native";

import { RoleGate } from "@/components/role-gate";
import { PH_COLORS } from "@/lib/theme";

function tabColor(focused: boolean) {
  return focused ? PH_COLORS.blue : PH_COLORS.mutedForeground;
}

export default function MerchantLayout() {
  return (
    <RoleGate role="merchant">
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
            title: "Redeem",
            tabBarIcon: ({ focused, size }) => (
              <QrCode color={tabColor(focused)} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="offline"
          options={{
            title: "Offline",
            tabBarIcon: ({ focused, size }) => (
              <CloudArrowUp color={tabColor(focused)} size={size} />
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
