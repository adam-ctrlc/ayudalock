<?php

declare(strict_types=1);

namespace App\Services\Hazard;

use App\Enums\HazardType;
use App\Models\HazardEvent;
use App\Models\Province;

final class HazardAggregator
{
    /**
     * Per-province impact for the choropleth. Includes every province (zeros
     * for unaffected) so the map can shade the whole country.
     *
     * @return array<int, array<string, mixed>>
     */
    public function perProvince(int $windowDays = 30): array
    {
        $since = now()->subDays($windowDays);

        $events = HazardEvent::query()
            ->whereNotNull('province_code')
            ->where('occurred_at', '>=', $since)
            ->get();

        $byProvince = [];

        foreach ($events as $event) {
            $code = $event->province_code;
            $byProvince[$code] ??= ['affected' => 0, 'severity' => 0, 'count' => 0, 'top' => null];
            $byProvince[$code]['affected'] += (int) ($event->affected_people ?? 0);
            $byProvince[$code]['severity'] = max($byProvince[$code]['severity'], (int) $event->severity);
            $byProvince[$code]['count']++;

            $top = $byProvince[$code]['top'];
            if ($top === null || (int) $event->severity > (int) $top->severity) {
                $byProvince[$code]['top'] = $event;
            }
        }

        $result = [];

        foreach (Province::all() as $province) {
            $agg = $byProvince[$province->code] ?? ['affected' => 0, 'severity' => 0, 'count' => 0, 'top' => null];

            $result[] = [
                'code' => $province->code,
                'name' => $province->name,
                'affected_people' => $agg['affected'],
                'severity' => $agg['severity'],
                'event_count' => $agg['count'],
                'top_event' => $this->formatEvent($agg['top']),
            ];
        }

        return $result;
    }

    /**
     * @return array<string, mixed>
     */
    public function detail(string $code, int $windowDays = 90): array
    {
        $province = Province::query()->where('code', $code)->first();
        $since = now()->subDays($windowDays);

        $events = HazardEvent::query()
            ->where('province_code', $code)
            ->where('occurred_at', '>=', $since)
            ->orderByDesc('occurred_at')
            ->limit(30)
            ->get();

        return [
            'code' => $code,
            'name' => $province?->name ?? $code,
            'affected_people' => (int) $events->sum('affected_people'),
            'severity' => (int) ($events->max('severity') ?? 0),
            'event_count' => $events->count(),
            'events' => $events->map(fn (HazardEvent $event): array => $this->formatEvent($event))->all(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function formatEvent(?HazardEvent $event): ?array
    {
        if ($event === null) {
            return null;
        }

        return [
            'id' => $event->id,
            'type' => $event->type instanceof HazardType ? $event->type->value : $event->type,
            'title' => $event->title,
            'magnitude' => $event->magnitude !== null ? (float) $event->magnitude : null,
            'severity' => (int) $event->severity,
            'affected_people' => $event->affected_people !== null ? (int) $event->affected_people : null,
            'occurred_at' => $event->occurred_at?->toIso8601String(),
        ];
    }
}
