import { apiRequest } from "@/lib/api/client";

export type ProvinceWeather = {
  code: string;
  name?: string;
  temperature: number | null;
  precipitation: number;
  wind_speed: number | null;
  weather_code: number | null;
  description: string | null;
};

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
