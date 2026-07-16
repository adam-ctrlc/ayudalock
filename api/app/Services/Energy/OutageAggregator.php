<?php

declare(strict_types=1);

namespace App\Services\Energy;

use App\Enums\InterruptionType;
use App\Models\PowerInterruption;
use App\Models\Province;
use Carbon\CarbonInterface;

final class OutageAggregator
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function perProvince(int $windowHours = 24, ?CarbonInterface $moment = null): array
    {
        $moment ??= now();
        $until = $moment->copy()->addHours($windowHours);

        $interruptions = PowerInterruption::query()
            ->whereNotNull('province_code')
            ->where('starts_at', '<', $until)
            ->where('ends_at', '>', $moment)
            ->get();

        $byProvince = [];

        foreach ($interruptions as $interruption) {
            $code = $interruption->province_code;
            $byProvince[$code] ??= ['households' => 0, 'minutes' => 0, 'count' => 0, 'active' => false, 'next' => null];

            $byProvince[$code]['households'] += (int) ($interruption->households_affected ?? 0);
            $byProvince[$code]['minutes'] += $this->overlapMinutes($interruption, $moment, $until);
            $byProvince[$code]['count']++;
            $byProvince[$code]['active'] = $byProvince[$code]['active'] || $interruption->coversMoment($moment);

            $next = $byProvince[$code]['next'];
            if ($next === null || $interruption->starts_at->lessThan($next->starts_at)) {
                $byProvince[$code]['next'] = $interruption;
            }
        }

        $result = [];

        foreach (Province::all() as $province) {
            $agg = $byProvince[$province->code] ?? ['households' => 0, 'minutes' => 0, 'count' => 0, 'active' => false, 'next' => null];

            $result[] = [
                'code' => $province->code,
                'name' => $province->name,
                'grid' => $province->grid?->value,
                'households_affected' => $agg['households'],
                'outage_minutes' => $agg['minutes'],
                'interruption_count' => $agg['count'],
                'is_active' => $agg['active'],
                'next_interruption' => $this->formatInterruption($agg['next']),
            ];
        }

        return $result;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function formatInterruption(?PowerInterruption $interruption): ?array
    {
        if ($interruption === null) {
            return null;
        }

        return [
            'id' => $interruption->id,
            'type' => $interruption->type instanceof InterruptionType ? $interruption->type->value : $interruption->type,
            'utility' => $interruption->utility,
            'starts_at' => $interruption->starts_at->toIso8601String(),
            'ends_at' => $interruption->ends_at->toIso8601String(),
            'households_affected' => $interruption->households_affected,
        ];
    }

    private function overlapMinutes(PowerInterruption $interruption, CarbonInterface $from, CarbonInterface $until): int
    {
        $start = $interruption->starts_at->greaterThan($from) ? $interruption->starts_at : $from;
        $end = $interruption->ends_at->lessThan($until) ? $interruption->ends_at : $until;

        return $end->greaterThan($start) ? (int) $start->diffInMinutes($end) : 0;
    }
}
