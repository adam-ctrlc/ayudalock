<?php

declare(strict_types=1);

namespace App\Services\Hazard;

use App\Enums\HazardType;
use App\Models\HazardEvent;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

final class UsgsEarthquakeService
{
    public function __construct(private readonly ProvinceLocator $locator) {}

    public function refresh(float $minMagnitude = 2.0, int $days = 90): int
    {
        $response = Http::timeout(20)->get(
            'https://earthquake.usgs.gov/fdsnws/event/1/query',
            [
                'format' => 'geojson',
                'minlatitude' => 4.5,
                'maxlatitude' => 21.5,
                'minlongitude' => 116,
                'maxlongitude' => 127,
                'minmagnitude' => $minMagnitude,
                'starttime' => now()->subDays($days)->toDateString(),
                'orderby' => 'time',
                'limit' => 200,
            ],
        );

        if (! $response->ok()) {
            return 0;
        }

        $imported = 0;

        foreach ($response->json('features') ?? [] as $feature) {
            $props = $feature['properties'] ?? [];
            $coords = $feature['geometry']['coordinates'] ?? null;
            $externalId = $feature['id'] ?? null;

            if ($coords === null || $externalId === null) {
                continue;
            }

            $longitude = (float) $coords[0];
            $latitude = (float) $coords[1];
            $magnitude = isset($props['mag']) && $props['mag'] !== null ? (float) $props['mag'] : null;
            $occurredAt = isset($props['time'])
                ? Carbon::createFromTimestampMs((int) $props['time'])
                : now();

            HazardEvent::updateOrCreate(
                ['external_id' => $externalId],
                [
                    'type' => HazardType::Earthquake->value,
                    'source' => 'usgs',
                    'title' => $props['place'] ?? 'Earthquake',
                    'place' => $props['place'] ?? null,
                    'magnitude' => $magnitude,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'province_code' => $this->locator->nearest($latitude, $longitude),
                    'severity' => $this->severityFromMagnitude($magnitude),
                    'occurred_at' => $occurredAt,
                ],
            );

            $imported++;
        }

        return $imported;
    }

    private function severityFromMagnitude(?float $magnitude): int
    {
        if ($magnitude === null) {
            return 0;
        }

        $scaled = (($magnitude - 3.0) / (8.0 - 3.0)) * 100;

        return (int) max(0, min(100, round($scaled)));
    }
}
