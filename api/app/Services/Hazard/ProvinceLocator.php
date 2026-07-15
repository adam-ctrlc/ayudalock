<?php

declare(strict_types=1);

namespace App\Services\Hazard;

use App\Models\Province;
use Illuminate\Support\Collection;

final class ProvinceLocator
{
    /**
     * @var Collection<int, Province>|null
     */
    private ?Collection $provinces = null;

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
