import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { CaretLeft, CaretRight, MagnifyingGlass } from "phosphor-react-native";

import { useWeatherPage } from "@/lib/queries/weather";
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Card } from "@/components/ui/card";
import { IconInput } from "@/components/ui/icon-input";
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

export function WeatherList() {
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

      {query.isLoading ? (
        <Card>
          <Text variant="caption">Loading weather…</Text>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <Text variant="caption">No provinces match your search.</Text>
        </Card>
      ) : (
        rows.map((w) => (
          <Card key={w.code} className="flex-row items-center gap-3">
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
          </Card>
        ))
      )}

      {meta && meta.last_page > 1 ? (
        <View className="flex-row items-center justify-between">
          <Pressable
            disabled={meta.page <= 1}
            onPress={() => setPage(meta.page - 1)}
            className={cn(
              "flex-row items-center gap-1 rounded-lg border border-border px-3 py-2 active:opacity-70",
              meta.page <= 1 && "opacity-40",
            )}
          >
            <CaretLeft size={16} color={PH_COLORS.foreground} />
            <Text variant="label">Prev</Text>
          </Pressable>
          <Text variant="caption">
            Page {meta.page} of {meta.last_page}
          </Text>
          <Pressable
            disabled={meta.page >= meta.last_page}
            onPress={() => setPage(meta.page + 1)}
            className={cn(
              "flex-row items-center gap-1 rounded-lg border border-border px-3 py-2 active:opacity-70",
              meta.page >= meta.last_page && "opacity-40",
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
