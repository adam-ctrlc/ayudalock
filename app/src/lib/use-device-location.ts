import { useCallback, useState } from "react";
import * as Location from "expo-location";

export type DeviceFix = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type LocationState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "granted"; fix: DeviceFix }
  | { status: "denied" }
  | { status: "unavailable" };

export function useDeviceLocation() {
  const [state, setState] = useState<LocationState>({ status: "idle" });

  const locate = useCallback(async () => {
    setState({ status: "locating" });

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setState({ status: "denied" });
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const fix: DeviceFix = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? null,
      };

      setState({ status: "granted", fix });

      return fix;
    } catch {
      setState({ status: "unavailable" });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, locate, reset };
}
