<?php

declare(strict_types=1);

namespace App\Services\Energy;

use App\Enums\GridIsland;
use App\Enums\GridLevel;
use App\Models\GridStatus;
use Illuminate\Support\Collection;

final class GridStatusService
{
    public function current(GridIsland $island): ?GridStatus
    {
        return GridStatus::query()
            ->where('island', $island)
            ->orderByDesc('observed_at')
            ->first();
    }

    /**
     * @return Collection<int, GridStatus>
     */
    public function currentForAllGrids(): Collection
    {
        return Collection::make(GridIsland::cases())
            ->map(fn (GridIsland $island): ?GridStatus => $this->current($island))
            ->filter()
            ->values();
    }

    public function levelFor(int $capacityMw, int $demandMw): GridLevel
    {
        $reserve = $capacityMw - $demandMw;

        if ($capacityMw <= 0) {
            return GridLevel::Normal;
        }

        $margin = $reserve / $capacityMw;

        return match (true) {
            $reserve <= 0, $margin < 0.02 => GridLevel::Red,
            $margin < 0.06 => GridLevel::Yellow,
            default => GridLevel::Normal,
        };
    }

    public function record(GridIsland $island, int $capacityMw, int $demandMw, string $source, ?string $note = null): GridStatus
    {
        return GridStatus::query()->updateOrCreate(
            ['island' => $island, 'observed_at' => now()->startOfMinute()],
            [
                'level' => $this->levelFor($capacityMw, $demandMw),
                'capacity_mw' => $capacityMw,
                'demand_mw' => $demandMw,
                'reserve_mw' => $capacityMw - $demandMw,
                'source' => $source,
                'note' => $note,
            ],
        );
    }
}
