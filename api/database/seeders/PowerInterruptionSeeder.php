<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\InterruptionStatus;
use App\Enums\InterruptionType;
use App\Models\Barangay;
use App\Models\PowerInterruption;
use App\Services\Energy\EnergyImpactService;
use App\Services\Energy\OutageScheduleService;
use Illuminate\Database\Seeder;

final class PowerInterruptionSeeder extends Seeder
{
    public function run(): void
    {
        $windows = [
            [
                'barangay' => 'Barangay 176',
                'type' => InterruptionType::Rotating,
                'utility' => 'Meralco',
                'starts_at' => now()->subHour(),
                'ends_at' => now()->addHours(2),
                'households_affected' => 4_200,
                'areas' => ['Barangay 176 Zone 1', 'Barangay 176 Zone 2'],
            ],
            [
                'barangay' => 'Barangay Bagong Silang',
                'type' => InterruptionType::Rotating,
                'utility' => 'Meralco',
                'starts_at' => now()->subHour(),
                'ends_at' => now()->addHours(2),
                'households_affected' => 6_800,
                'areas' => ['Phase 1', 'Phase 2', 'Phase 3'],
            ],
            [
                'barangay' => 'Barangay Commonwealth',
                'type' => InterruptionType::Scheduled,
                'utility' => 'Meralco',
                'starts_at' => now()->addHours(6),
                'ends_at' => now()->addHours(9),
                'households_affected' => 3_100,
                'areas' => ['Commonwealth Avenue corridor'],
            ],
        ];

        foreach ($windows as $window) {
            $barangay = Barangay::query()->where('name', $window['barangay'])->first();

            if ($barangay === null) {
                continue;
            }

            PowerInterruption::query()->updateOrCreate(
                ['external_id' => 'seed-'.str($window['barangay'])->slug()],
                [
                    'type' => $window['type'],
                    'status' => InterruptionStatus::Announced,
                    'utility' => $window['utility'],
                    'province_code' => $barangay->province_code,
                    'barangay_id' => $barangay->getKey(),
                    'areas' => $window['areas'],
                    'households_affected' => $window['households_affected'],
                    'source' => 'seeded',
                    'starts_at' => $window['starts_at'],
                    'ends_at' => $window['ends_at'],
                ],
            );
        }

        (new EnergyImpactService(new OutageScheduleService()))->syncPowerStatus();
    }
}
