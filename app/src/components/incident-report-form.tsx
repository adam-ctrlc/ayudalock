import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Camera, Crosshair, MapPin, Trash } from "phosphor-react-native";

import { ApiError } from "@/lib/api/client";
import type { IncidentType, LocationSource } from "@/lib/api/incident-reports";
import { useCreateIncidentReport } from "@/lib/queries/incident-reports";
import { useDeviceLocation } from "@/lib/use-device-location";
import { captureIncidentPhoto, pickIncidentPhoto } from "@/lib/incident-photo";
import { PH_PROVINCES } from "@/lib/geo/ph-provinces";
import { latLngToSvg } from "@/lib/geo/svg-to-latlng";
import { provinceAt } from "@/lib/geo/point-in-province";
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDialog } from "@/components/ui/dialog";

const TYPES: { key: IncidentType; label: string }[] = [
  { key: "flood", label: "Flooding" },
  { key: "fire", label: "Fire" },
  { key: "landslide", label: "Landslide" },
  { key: "earthquake_damage", label: "Quake damage" },
  { key: "road_blocked", label: "Road blocked" },
  { key: "power_line_down", label: "Downed line" },
  { key: "medical", label: "Medical" },
  { key: "sea_incident", label: "Sea incident" },
  { key: "security", label: "Security" },
  { key: "other", label: "Other" },
];

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-full px-3 py-1.5",
        active ? "bg-primary" : "bg-muted",
      )}
    >
      <Text
        className={cn(
          "text-sm font-medium",
          active ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function IncidentReportForm() {
  const router = useRouter();
  const create = useCreateIncidentReport();
  const location = useDeviceLocation();
  const dialog = useDialog();

  const [type, setType] = useState<IncidentType>("flood");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busyPhoto, setBusyPhoto] = useState(false);

  const provinceName = PH_PROVINCES.find((p) => p.code === provinceCode)?.title;

  const matches = provinceQuery.trim()
    ? PH_PROVINCES.filter((p) =>
        p.title.toLowerCase().includes(provinceQuery.trim().toLowerCase()),
      ).slice(0, 6)
    : [];

  const fix = location.state.status === "granted" ? location.state.fix : null;

  function locationSource(): LocationSource {
    switch (true) {
      case fix !== null:
        return "gps";
      default:
        return "manual_province";
    }
  }

  async function useMyLocation() {
    const found = await location.locate();

    if (found === null) return;

    const point = latLngToSvg(found.latitude, found.longitude);
    const guess = provinceAt(point.x, point.y);

    if (guess !== null) setProvinceCode(guess.code);
  }

  async function addPhoto(capture: boolean) {
    setBusyPhoto(true);

    try {
      const encoded = capture
        ? await captureIncidentPhoto()
        : await pickIncidentPhoto();

      if (encoded === null) {
        dialog.alert({
          title: "No photo added",
          message:
            "Permission was declined, or the photo was still too large after shrinking. You can send the report without one.",
        });
        return;
      }

      setPhoto(encoded);
    } finally {
      setBusyPhoto(false);
    }
  }

  function submit() {
    if (!title.trim() || !description.trim()) {
      dialog.alert({
        title: "Missing details",
        message: "Add a short title and describe what you can see.",
      });
      return;
    }

    if (fix === null && provinceCode === null) {
      dialog.alert({
        title: "Where is this?",
        message: "Use your current location, or pick the province.",
      });
      return;
    }

    create.mutate(
      {
        type,
        title: title.trim(),
        description: description.trim(),
        location_source: locationSource(),
        latitude: fix?.latitude ?? null,
        longitude: fix?.longitude ?? null,
        province_code: provinceCode,
        accuracy_meters: fix?.accuracy != null ? Math.round(fix.accuracy) : null,
        photo_thumbnail: photo,
      },
      {
        onSuccess: () => {
          dialog.alert({
            title: "Report sent",
            message:
              "Your LGU can see it now. You will be notified when it is reviewed and referred.",
          });
          router.back();
        },
        onError: (e) =>
          dialog.alert({
            title: "Could not send",
            message: e instanceof ApiError ? e.message : "Please try again.",
          }),
      },
    );
  }

  return (
    <>
      <Text variant="subtitle">
        Tell your LGU what you can see. They review every report before it goes
        on the public map.
      </Text>

      <Field label="What is happening?">
        <View className="flex-row flex-wrap gap-2">
          {TYPES.map((t) => (
            <Chip
              key={t.key}
              label={t.label}
              active={type === t.key}
              onPress={() => setType(t.key)}
            />
          ))}
        </View>
      </Field>

      <Field label="Title">
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="Waist-deep flooding on Commonwealth Ave"
        />
      </Field>

      <Field label="What are you seeing?">
        <Input
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder="The southbound lane is impassable and the water is rising."
        />
      </Field>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <MapPin size={18} color={PH_COLORS.blue} weight="duotone" />
          <Text variant="label">Location</Text>
        </View>

        {fix ? (
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <Badge variant="success" label="Using your location" />
              {fix.accuracy != null ? (
                <Text variant="caption">
                  accurate to about {Math.round(fix.accuracy)}m
                </Text>
              ) : null}
            </View>
            <Text variant="caption">
              {fix.latitude.toFixed(4)}, {fix.longitude.toFixed(4)}
            </Text>
            <Pressable onPress={location.reset} hitSlop={6}>
              <Text className="text-xs font-semibold text-primary">
                Drop my location
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Button
              variant="secondary"
              label={
                location.state.status === "locating"
                  ? "Finding you..."
                  : "Use my current location"
              }
              loading={location.state.status === "locating"}
              onPress={useMyLocation}
            />

            {location.state.status === "denied" ? (
              <Text variant="caption">
                Location permission was declined. Pick the province below
                instead.
              </Text>
            ) : null}

            {location.state.status === "unavailable" ? (
              <Text variant="caption">
                Could not get a fix. Pick the province below instead.
              </Text>
            ) : null}

          </>
        )}

        <View className="gap-2 border-t border-border pt-3">
          <Text variant="caption">
            {fix
              ? "Province, worked out from your pin. Correct it if it is wrong."
              : "Province"}
          </Text>

          {provinceCode ? (
            <Pressable
              onPress={() => {
                setProvinceCode(null);
                setProvinceQuery("");
              }}
              className="h-12 flex-row items-center justify-between rounded-xl border border-input bg-muted px-4"
            >
              <Text variant="label">{provinceName}</Text>
              <Text variant="caption" className="text-primary">
                Change
              </Text>
            </Pressable>
          ) : (
            <View className="gap-2">
              <Input
                value={provinceQuery}
                onChangeText={setProvinceQuery}
                autoCapitalize="words"
                placeholder="Search a province"
              />
              {matches.map((p) => (
                <Pressable
                  key={p.code}
                  onPress={() => {
                    setProvinceCode(p.code);
                    setProvinceQuery("");
                  }}
                  className="rounded-xl border border-border px-4 py-2.5 active:opacity-70"
                >
                  <Text variant="label">{p.title}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Camera size={18} color={PH_COLORS.blue} weight="duotone" />
          <Text variant="label">Photo (optional)</Text>
        </View>

        {photo ? (
          <View className="gap-2">
            <Image
              source={{ uri: photo }}
              className="h-40 w-full rounded-xl"
              resizeMode="cover"
            />
            <Pressable
              className="flex-row items-center gap-1.5"
              onPress={() => setPhoto(null)}
            >
              <Trash size={16} color={PH_COLORS.red} />
              <Text className="text-xs font-semibold text-destructive">
                Remove photo
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row gap-2">
            <Button
              className="flex-1"
              variant="outline"
              label="Take photo"
              loading={busyPhoto}
              onPress={() => addPhoto(true)}
            />
            <Button
              className="flex-1"
              variant="outline"
              label="Choose photo"
              loading={busyPhoto}
              onPress={() => addPhoto(false)}
            />
          </View>
        )}
      </Card>

      <Button
        label="Send report"
        loading={create.isPending}
        onPress={submit}
      />

      <View className="flex-row items-start gap-2">
        <Crosshair size={14} color={PH_COLORS.mutedForeground} />
        <Text variant="caption" className="flex-1">
          For life-threatening emergencies call 911 first. This report reaches
          your LGU, not an emergency dispatcher.
        </Text>
      </View>
    </>
  );
}
