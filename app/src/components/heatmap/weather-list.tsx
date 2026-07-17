import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { CaretLeft, CaretRight, MagnifyingGlass } from "phosphor-react-native";

import { ApiError } from "@/lib/api/client";
import type { ProvinceWeather } from "@/lib/api/weather";
import {
  useClearWeatherOverride,
  useOverrideWeather,
  useWeatherPage,
} from "@/lib/queries/weather";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDialog } from "@/components/ui/dialog";
import { IconInput } from "@/components/ui/icon-input";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { colorForRatio } from "@/components/heatmap/severity-scale";

const PER_PAGE = 8;

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
        "rounded-full border px-3 py-1.5 active:opacity-70",
        active ? "border-primary bg-primary" : "border-border bg-card",
      )}
    >
      <Text
        className={cn(
          "text-xs font-medium",
          active ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function WeatherOverrideRow({ province }: { province: ProvinceWeather }) {
  const override = useOverrideWeather();
  const clear = useClearWeatherOverride();
  const dialog = useDialog();
  const [open, setOpen] = useState(false);
  const [rain, setRain] = useState("");
  const [note, setNote] = useState("");

  function submit() {
    if (!rain.trim() || !note.trim()) {
      dialog.alert({
        title: "Source required",
        message:
          "Enter the rainfall and say where the reading came from. Manual values are published with their source.",
      });
      return;
    }

    override.mutate(
      {
        code: province.code,
        body: { precipitation: Number(rain), weather_note: note.trim() },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setRain("");
          setNote("");
        },
        onError: (e) =>
          dialog.alert({
            title: "Could not set",
            message: e instanceof ApiError ? e.message : "Please try again.",
          }),
      },
    );
  }

  if (!open) {
    return (
      <View className="flex-row gap-2 border-t border-border pt-2">
        <Pressable hitSlop={6} onPress={() => setOpen(true)}>
          <Text className="text-xs font-semibold text-primary">
            {province.is_live ? "Set manually" : "Change"}
          </Text>
        </Pressable>
        {province.is_live ? null : (
          <Pressable hitSlop={6} onPress={() => clear.mutate(province.code)}>
            <Text className="text-xs font-semibold text-destructive">
              Resume live data
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View className="gap-2 border-t border-border pt-2">
      <Input
        value={rain}
        onChangeText={setRain}
        keyboardType="decimal-pad"
        placeholder="Rainfall in mm"
      />
      <Input
        value={note}
        onChangeText={setNote}
        placeholder="Where did this reading come from?"
      />
      <View className="flex-row gap-2">
        <Button
          className="flex-1"
          variant="secondary"
          label="Save"
          loading={override.isPending}
          onPress={submit}
        />
        <Button
          className="flex-1"
          variant="outline"
          label="Cancel"
          onPress={() => setOpen(false)}
        />
      </View>
    </View>
  );
}

export function WeatherList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "lgu_admin";
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, condition]);

  const query = useWeatherPage({
    search,
    condition: condition ?? undefined,
    sort: "name",
    page,
    perPage: PER_PAGE,
  });

  const rows = query.data?.data ?? [];
  const conditions = query.data?.conditions ?? [];
  const meta = query.data?.meta;
  const maxPrecip = Math.max(1, ...rows.map((w) => w.precipitation ?? 0));

  const pending = query.isLoading || query.isPlaceholderData;
  const lastPage = meta?.last_page ?? 1;
  const skeletonCount = Math.min(PER_PAGE, Math.max(rows.length, 3));

  return (
    <View className="gap-3">
      <IconInput
        icon={<MagnifyingGlass size={20} color={PH_COLORS.mutedForeground} />}
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search a province"
        autoCapitalize="none"
      />

      <View className="flex-row flex-wrap gap-2">
        <Chip
          label="All"
          active={condition === null}
          onPress={() => setCondition(null)}
        />
        {conditions.map((c) => (
          <Chip
            key={c}
            label={c}
            active={condition === c}
            onPress={() => setCondition(c)}
          />
        ))}
      </View>

      {pending ? (
        Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-[62px] w-full rounded-2xl" />
        ))
      ) : rows.length === 0 ? (
        <Card>
          <Text variant="caption">No provinces match your search.</Text>
        </Card>
      ) : (
        rows.map((w) => (
          <Card key={w.code} className="gap-2">
            <View className="flex-row items-center gap-3">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: colorForRatio((w.precipitation ?? 0) / maxPrecip),
                }}
              />
              <View className="flex-1">
                <Text variant="label">{w.name ?? w.code}</Text>
                <Text variant="caption">
                  {w.description ?? "—"}
                  {w.temperature != null ? ` · ${Math.round(w.temperature)}°C` : ""}
                  {(w.precipitation ?? 0) > 0 ? ` · ${w.precipitation}mm rain` : ""}
                  {w.wind_speed != null ? ` · ${Math.round(w.wind_speed)} km/h` : ""}
                </Text>
              </View>
              {w.is_live ? null : <Badge variant="accent" label="manual" />}
            </View>

            {w.is_live ? null : (
              <Text variant="caption" className="text-muted-foreground">
                Set by the LGU, not a live reading{w.note ? `: ${w.note}` : "."}
              </Text>
            )}

            {isAdmin ? (
              <WeatherOverrideRow province={w} />
            ) : null}
          </Card>
        ))
      )}

      {lastPage > 1 ? (
        <View className="flex-row items-center justify-between">
          <Pressable
            disabled={page <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            className={cn(
              "flex-row items-center gap-1 rounded-lg border border-border px-3 py-2 active:opacity-70",
              page <= 1 && "opacity-40",
            )}
          >
            <CaretLeft size={16} color={PH_COLORS.foreground} />
            <Text variant="label">Prev</Text>
          </Pressable>
          <Text variant="caption">
            Page {page} of {lastPage}
          </Text>
          <Pressable
            disabled={page >= lastPage}
            onPress={() => setPage((p) => Math.min(lastPage, p + 1))}
            className={cn(
              "flex-row items-center gap-1 rounded-lg border border-border px-3 py-2 active:opacity-70",
              page >= lastPage && "opacity-40",
            )}
          >
            <Text variant="label">Next</Text>
            <CaretRight size={16} color={PH_COLORS.foreground} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
