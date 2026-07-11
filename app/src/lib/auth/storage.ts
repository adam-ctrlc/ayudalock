import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "ayudalock.token";
const isWeb = Platform.OS === "web";

export async function getStoredToken(): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
}

export async function storeToken(token: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(KEY, token);
    return;
  }
  await SecureStore.setItemAsync(KEY, token);
}

export async function clearToken(): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
