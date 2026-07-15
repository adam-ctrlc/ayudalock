import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  listProvinceWeather,
  listWeatherPage,
  type WeatherListParams,
} from "@/lib/api/weather";
import { qk } from "@/lib/queries/keys";

export function useProvinceWeather() {
  return useQuery({
    queryKey: qk.weather,
    queryFn: ({ signal }) => listProvinceWeather(signal),
    staleTime: 10 * 60 * 1000,
  });
}

export function useWeatherPage(params: WeatherListParams) {
  return useQuery({
    queryKey: [...qk.weather, "list", params],
    queryFn: ({ signal }) => listWeatherPage(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}
