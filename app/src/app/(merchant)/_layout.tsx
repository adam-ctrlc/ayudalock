import { Tabs } from "expo-router";
import { CloudArrowUp, QrCode, User } from "phosphor-react-native";

import { RoleGate } from "@/components/role-gate";
import { PH_COLORS } from "@/lib/theme";

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
            tabBarIcon: ({ color, size }) => <QrCode color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="offline"
          options={{
            title: "Offline",
            tabBarIcon: ({ color, size }) => (
              <CloudArrowUp color={color} size={size} />
            ),
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
