import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Providers } from "@/components/providers";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Providers>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </Providers>
    </SafeAreaProvider>
  );
}
