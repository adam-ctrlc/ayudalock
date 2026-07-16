<?php

declare(strict_types=1);

namespace App\Services\Hazard;

use App\Models\Province;
use Illuminate\Support\Collection;

final class ProvinceLocator
{
    private const NCR_CODE = 'PH-MNL';

    /**
     * @var list<string>
     */
    private const NCR_CITIES = [
        'caloocan', 'las pinas', 'las piñas', 'makati', 'malabon', 'mandaluyong',
        'manila', 'marikina', 'muntinlupa', 'navotas', 'paranaque', 'parañaque',
        'pasay', 'pasig', 'pateros', 'quezon city', 'san juan', 'taguig', 'valenzuela',
    ];

    /**
     * @var Collection<int, Province>|null
     */
    private ?Collection $provinces = null;

    public function forCity(string $city, ?float $latitude = null, ?float $longitude = null): ?string
    {
        $normalized = mb_strtolower(trim($city));

        if (in_array($normalized, self::NCR_CITIES, true)) {
            return self::NCR_CODE;
        }

        return match (true) {
            $latitude === null, $longitude === null => null,
            default => $this->nearest($latitude, $longitude),
        };
    }

    public function nearest(float $latitude, float $longitude): ?string
    {
        $this->provinces ??= Province::query()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get(['code', 'latitude', 'longitude']);

        $bestCode = null;
        $bestDistance = INF;

        foreach ($this->provinces as $province) {
            $dLat = (float) $province->latitude - $latitude;
            $dLng = (float) $province->longitude - $longitude;
            $distance = ($dLat * $dLat) + ($dLng * $dLng);

            if ($distance < $bestDistance) {
                $bestDistance = $distance;
                $bestCode = $province->code;
            }
        }

        return $bestCode;
    }
}
