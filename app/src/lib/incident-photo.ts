import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

const MAX_EDGE = 512;
const QUALITY = 0.4;
const MAX_LENGTH = 200000;

async function shrink(uri: string): Promise<string | null> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_EDGE } }],
    {
      compress: QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  if (!result.base64) return null;

  const encoded = `data:image/jpeg;base64,${result.base64}`;

  return encoded.length > MAX_LENGTH ? null : encoded;
}

export async function captureIncidentPhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({ quality: QUALITY });

  if (result.canceled || result.assets.length === 0) return null;

  return shrink(result.assets[0].uri);
}

export async function pickIncidentPhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: QUALITY,
  });

  if (result.canceled || result.assets.length === 0) return null;

  return shrink(result.assets[0].uri);
}
