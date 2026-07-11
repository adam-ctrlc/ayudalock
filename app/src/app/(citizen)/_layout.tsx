import { Tabs } from "expo-router";
import { House, MapPin, Tag, User } from "phosphor-react-native";

import { RoleGate } from "@/components/role-gate";
import { PH_COLORS } from "@/lib/theme";

function tabColor(focused: boolean) {
  return focused ? PH_COLORS.blue : PH_COLORS.mutedForeground;
}

export default function CitizenLayout() {
  return (
    <RoleGate role="citizen">
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
            title: "Home",
            tabBarIcon: ({ focused, size }) => (
              <House color={tabColor(focused)} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="locations"
          options={{
            title: "Claim",
            tabBarIcon: ({ focused, size }) => (
              <MapPin color={tabColor(focused)} size={size} />
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
