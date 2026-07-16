<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\GridIsland;
use App\Models\GridStatus;
use App\Services\Energy\GridStatusService;
use Illuminate\Database\Seeder;

final class GridStatusSeeder extends Seeder
{
    public function run(): void
    {
        $service = new GridStatusService();

        $grids = [
            ['island' => GridIsland::Luzon, 'capacity_mw' => 13_200, 'demand_mw' => 13_020, 'note' => 'Rotating manual load dropping in effect. Four generating units on forced outage.'],
            ['island' => GridIsland::Visayas, 'capacity_mw' => 2_540, 'demand_mw' => 2_420, 'note' => 'Thin reserves during afternoon peak.'],
            ['island' => GridIsland::Mindanao, 'capacity_mw' => 2_260, 'demand_mw' => 1_910, 'note' => 'Sufficient operating reserve.'],
        ];

        foreach ($grids as $grid) {
            GridStatus::query()->updateOrCreate(
                ['island' => $grid['island'], 'observed_at' => now()->startOfMinute()],
                [
                    'level' => $service->levelFor($grid['capacity_mw'], $grid['demand_mw']),
                    'capacity_mw' => $grid['capacity_mw'],
                    'demand_mw' => $grid['demand_mw'],
                    'reserve_mw' => $grid['capacity_mw'] - $grid['demand_mw'],
                    'source' => 'seeded',
                    'note' => $grid['note'],
                ],
            );
        }
    }
}
