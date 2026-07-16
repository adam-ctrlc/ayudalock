import { Tabs } from "expo-router";
import { CloudArrowUp, Megaphone, QrCode, User } from "phosphor-react-native";

import { RoleGate } from "@/components/role-gate";
import { useVoucherKey } from "@/lib/queries/voucher-key";
import { PH_COLORS } from "@/lib/theme";

function tabColor(focused: boolean) {
  return focused ? PH_COLORS.blue : PH_COLORS.mutedForeground;
}

export default function MerchantLayout() {
  useVoucherKey();

  return (
    <RoleGate role="merchant">
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
            tabBarLabel: "Redeem",
            tabBarIcon: ({ focused, size }) => (
              <QrCode color={tabColor(focused)} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="offline"
          options={{
            tabBarLabel: "Offline",
            tabBarIcon: ({ focused, size }) => (
              <CloudArrowUp color={tabColor(focused)} size={size} />
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
