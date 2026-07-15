<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\HazardType;
use App\Models\HazardEvent;
use Illuminate\Database\Seeder;

final class HazardEventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'type' => HazardType::Typhoon->value,
                'title' => 'Typhoon flooding (Bicol)',
                'place' => 'Camarines Sur',
                'province_code' => 'PH-CAS',
                'affected_people' => 128000,
                'severity' => 72,
                'days_ago' => 3,
            ],
            [
                'type' => HazardType::Typhoon->value,
                'title' => 'Typhoon flooding (Albay)',
                'place' => 'Albay',
                'province_code' => 'PH-ALB',
                'affected_people' => 86000,
                'severity' => 66,
                'days_ago' => 3,
            ],
            [
                'type' => HazardType::Flood->value,
                'title' => 'Cagayan river flooding',
                'place' => 'Cagayan',
                'province_code' => 'PH-CAG',
                'affected_people' => 45000,
                'severity' => 58,
                'days_ago' => 6,
            ],
            [
                'type' => HazardType::Flood->value,
                'title' => 'Flash floods',
                'place' => 'Maguindanao',
                'province_code' => 'PH-MG',
                'affected_people' => 21000,
                'severity' => 49,
                'days_ago' => 8,
            ],
            [
                'type' => HazardType::Earthquake->value,
                'title' => 'M6.2 quake felt in Davao region',
                'place' => 'Davao del Sur',
                'province_code' => 'PH-DAS',
                'magnitude' => 6.2,
                'affected_people' => 6000,
                'severity' => 80,
                'days_ago' => 1,
            ],
        ];

        foreach ($events as $event) {
            $daysAgo = $event['days_ago'];
            unset($event['days_ago']);

            HazardEvent::create([
                ...$event,
                'source' => 'manual',
                'occurred_at' => now()->subDays($daysAgo),
            ]);
        }
    }
}
