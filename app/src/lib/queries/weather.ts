import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  clearProvinceWeatherOverride,
  listProvinceWeather,
  listWeatherPage,
  overrideProvinceWeather,
  type WeatherListParams,
  type WeatherOverrideInput,
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

function useWeatherInvalidation() {
  const qc = useQueryClient();

  return () => {
    qc.invalidateQueries({ queryKey: qk.weather });
    qc.invalidateQueries({ queryKey: qk.impactMap });
  };
}

export function useOverrideWeather() {
  const invalidate = useWeatherInvalidation();
  return useMutation({
    mutationFn: (args: { code: string; body: WeatherOverrideInput }) =>
      overrideProvinceWeather(args.code, args.body),
    onSuccess: invalidate,
  });
}

export function useClearWeatherOverride() {
  const invalidate = useWeatherInvalidation();
  return useMutation({
    mutationFn: (code: string) => clearProvinceWeatherOverride(code),
    onSuccess: invalidate,
  });
}
