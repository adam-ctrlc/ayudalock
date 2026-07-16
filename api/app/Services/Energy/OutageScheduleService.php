<?php

declare(strict_types=1);

namespace App\Services\Energy;

use App\Models\PowerInterruption;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

final class OutageScheduleService
{
    /**
     * @return Collection<int, PowerInterruption>
     */
    public function activeNow(?CarbonInterface $moment = null): Collection
    {
        return PowerInterruption::query()
            ->activeAt($moment ?? now())
            ->orderBy('ends_at')
            ->get();
    }

    /**
     * @return Collection<int, PowerInterruption>
     */
    public function forProvince(string $code, ?CarbonInterface $moment = null): Collection
    {
        $moment ??= now();

        return PowerInterruption::query()
            ->where('province_code', $code)
            ->where('ends_at', '>', $moment)
            ->orderBy('starts_at')
            ->limit(30)
            ->get();
    }

    /**
     * @return Collection<int, PowerInterruption>
     */
    public function upcoming(?CarbonInterface $moment = null, int $withinHours = 24): Collection
    {
        $moment ??= now();

        return PowerInterruption::query()
            ->upcoming($moment)
            ->where('starts_at', '<=', $moment->copy()->addHours($withinHours))
            ->orderBy('starts_at')
            ->get();
    }

    public function nextForBarangay(int $barangayId, ?string $provinceCode, ?CarbonInterface $moment = null): ?PowerInterruption
    {
        $moment ??= now();

        return PowerInterruption::query()
            ->where('ends_at', '>', $moment)
            ->where(function ($query) use ($barangayId, $provinceCode): void {
                $query->where('barangay_id', $barangayId);

                if ($provinceCode !== null) {
                    $query->orWhere(function ($nested) use ($provinceCode): void {
                        $nested->whereNull('barangay_id')->where('province_code', $provinceCode);
                    });
                }
            })
            ->orderBy('starts_at')
            ->first();
    }
}
