import { apiRequest } from "@/lib/api/client";

export type WeatherSource = "open-meteo" | "manual";

export type ProvinceWeather = {
  code: string;
  name?: string;
  temperature: number | null;
  precipitation: number;
  wind_speed: number | null;
  weather_code: number | null;
  description: string | null;
  source: WeatherSource;
  source_label: string;
  is_live: boolean;
  note: string | null;
  updated_at: string | null;
};

export type WeatherOverrideInput = {
  precipitation: number;
  temperature?: number | null;
  wind_speed?: number | null;
  weather_description?: string | null;
  weather_note: string;
};

export async function overrideProvinceWeather(
  code: string,
  body: WeatherOverrideInput,
) {
  const res = await apiRequest<{ data: ProvinceWeather }>(
    `/heatmap/weather/${code}`,
    { method: "PUT", body },
  );
  return res.data;
}

export async function clearProvinceWeatherOverride(code: string) {
  return apiRequest<{ message: string; data: ProvinceWeather }>(
    `/heatmap/weather/${code}`,
    { method: "DELETE" },
  );
}

export async function listProvinceWeather(signal?: AbortSignal) {
  const res = await apiRequest<{ data: ProvinceWeather[] }>("/heatmap/weather", {
    auth: false,
    signal,
  });
  return res.data;
}

export type WeatherSort = "name" | "rain" | "temperature";

export type WeatherListParams = {
  search?: string;
  condition?: string;
  sort?: WeatherSort;
  page?: number;
  perPage?: number;
};

export type WeatherPage = {
  data: ProvinceWeather[];
  meta: { page: number; per_page: number; total: number; last_page: number };
  conditions: string[];
};

export async function listWeatherPage(
  params: WeatherListParams,
  signal?: AbortSignal,
) {
  return apiRequest<WeatherPage>("/heatmap/weather/list", {
    auth: false,
    signal,
    query: {
      search: params.search,
      condition: params.condition,
      sort: params.sort,
      page: params.page,
      per_page: params.perPage,
    },
  });
}
