<?php

declare(strict_types=1);

namespace App\Services\Hazard;

use App\Models\Province;
use Illuminate\Support\Facades\Http;

final class WeatherService
{
    /**
     * Refresh current weather for every province from Open-Meteo (one batched
     * request) and persist it on the province rows.
     */
    public function refresh(): int
    {
        $provinces = Province::query()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        if ($provinces->isEmpty()) {
            return 0;
        }

        $response = Http::timeout(20)->get('https://api.open-meteo.com/v1/forecast', [
            'latitude' => $provinces->pluck('latitude')->implode(','),
            'longitude' => $provinces->pluck('longitude')->implode(','),
            'current' => 'temperature_2m,precipitation,weather_code,wind_speed_10m',
            'timezone' => 'auto',
        ]);

        if (! $response->ok()) {
            return 0;
        }

        $payload = $response->json();
        $entries = array_is_list($payload) ? $payload : [$payload];
        $now = now();

        foreach ($provinces as $index => $province) {
            $current = $entries[$index]['current'] ?? [];
            $code = isset($current['weather_code']) ? (int) $current['weather_code'] : null;

            $province->update([
                'temperature' => isset($current['temperature_2m']) ? (float) $current['temperature_2m'] : null,
                'precipitation' => isset($current['precipitation']) ? (float) $current['precipitation'] : 0.0,
                'weather_code' => $code,
                'weather_description' => $this->describe($code),
                'wind_speed' => isset($current['wind_speed_10m']) ? (float) $current['wind_speed_10m'] : null,
                'weather_updated_at' => $now,
            ]);
        }

        return $provinces->count();
    }

    /**
     * Refresh only when the cached weather is older than $minutes, so reads
     * (search, pagination) never hammer the upstream API.
     */
    public function refreshIfStale(int $minutes = 30): void
    {
        $last = Province::max('weather_updated_at');

        if ($last !== null && now()->diffInMinutes($last) < $minutes) {
            return;
        }

        try {
            $this->refresh();
        } catch (\Throwable) {
            // Keep serving whatever is cached if the upstream call fails.
        }
    }

    private function describe(?int $code): ?string
    {
        if ($code === null) {
            return null;
        }

        return match (true) {
            $code === 0 => 'Clear',
            $code <= 3 => 'Partly cloudy',
            $code === 45 || $code === 48 => 'Fog',
            $code >= 51 && $code <= 57 => 'Drizzle',
            $code >= 61 && $code <= 67 => 'Rain',
            $code >= 71 && $code <= 77 => 'Snow',
            $code >= 80 && $code <= 82 => 'Rain showers',
            $code >= 85 && $code <= 86 => 'Snow showers',
            $code >= 95 => 'Thunderstorm',
            default => 'Cloudy',
        };
    }
}
