<?php

declare(strict_types=1);

namespace App\Services\Energy;

use App\Enums\PowerStatus;
use App\Models\Location;
use App\Models\PowerInterruption;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

final class EnergyImpactService
{
    public function __construct(
        private readonly OutageScheduleService $schedule,
    ) {}

    public function statusFor(Location $location, ?CarbonInterface $moment = null): PowerStatus
    {
        $covering = $this->activeCovering($location, $moment);

        return match (true) {
            $covering === null => PowerStatus::Online,
            (bool) $location->has_generator => PowerStatus::Generator,
            default => PowerStatus::Offline,
        };
    }

    public function activeCovering(Location $location, ?CarbonInterface $moment = null): ?PowerInterruption
    {
        $moment ??= now();
        $location->loadMissing('barangay');

        return $this->schedule->activeNow($moment)
            ->first(fn (PowerInterruption $interruption): bool => $this->covers($interruption, $location));
    }

    public function syncPowerStatus(?CarbonInterface $moment = null): int
    {
        $moment ??= now();
        $active = $this->schedule->activeNow($moment);
        $changed = 0;

        Location::query()->with('barangay')->each(function (Location $location) use ($active, &$changed): void {
            $covering = $active->first(fn (PowerInterruption $interruption): bool => $this->covers($interruption, $location));

            $status = match (true) {
                $covering === null => PowerStatus::Online,
                (bool) $location->has_generator => PowerStatus::Generator,
                default => PowerStatus::Offline,
            };

            if ($location->power_status === $status) {
                return;
            }

            $location->power_status = $status;
            $location->power_status_updated_at = now();
            $location->save();

            $changed++;
        });

        return $changed;
    }

    /**
     * @return Collection<int, Location>
     */
    public function resilientAlternatives(Location $dark, int $limit = 3): Collection
    {
        $dark->loadMissing('barangay');

        return Location::query()
            ->with('barangay')
            ->where('is_active', true)
            ->where('type', $dark->type)
            ->whereKeyNot($dark->getKey())
            ->whereIn('power_status', [PowerStatus::Online, PowerStatus::Generator])
            ->get()
            ->sortBy(fn (Location $candidate): float => $this->distanceSquared($dark, $candidate))
            ->take($limit)
            ->values();
    }

    private function covers(PowerInterruption $interruption, Location $location): bool
    {
        if ($interruption->barangay_id !== null) {
            return $interruption->barangay_id === $location->barangay_id;
        }

        $provinceCode = $location->barangay?->province_code;

        return $provinceCode !== null && $interruption->province_code === $provinceCode;
    }

    private function distanceSquared(Location $from, Location $to): float
    {
        $dLat = (float) $to->latitude - (float) $from->latitude;
        $dLng = (float) $to->longitude - (float) $from->longitude;

        return ($dLat * $dLat) + ($dLng * $dLng);
    }
}
