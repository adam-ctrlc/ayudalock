<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PriceCategory;
use App\Models\PriceReference;
use App\Services\Price\PriceReferenceService;
use Illuminate\Database\Seeder;

final class PriceReferenceSeeder extends Seeder
{
    public function run(PriceReferenceService $prices): void
    {
        $base = [
            ['category' => PriceCategory::Fuel->value, 'name' => 'Diesel', 'value' => 132.50, 'unit' => 'per liter'],
            ['category' => PriceCategory::Fuel->value, 'name' => 'Gasoline (RON95)', 'value' => 104.80, 'unit' => 'per liter'],
            ['category' => PriceCategory::Fuel->value, 'name' => 'Kerosene', 'value' => 112.90, 'unit' => 'per liter'],

            ['category' => PriceCategory::Fare->value, 'name' => 'Jeepney (first 4 km)', 'value' => 13.00, 'unit' => 'PHP'],
            ['category' => PriceCategory::Fare->value, 'name' => 'Tricycle (first km)', 'value' => 12.00, 'unit' => 'PHP'],
            ['category' => PriceCategory::Fare->value, 'name' => 'UV Express (first 4 km)', 'value' => 15.00, 'unit' => 'PHP'],

            ['category' => PriceCategory::Commodity->value, 'name' => 'Regular Milled Rice', 'value' => 57.00, 'unit' => 'per kg'],
            ['category' => PriceCategory::Commodity->value, 'name' => 'Well Milled Rice', 'value' => 62.00, 'unit' => 'per kg'],
            ['category' => PriceCategory::Commodity->value, 'name' => 'Brown Sugar', 'value' => 95.00, 'unit' => 'per kg'],
            ['category' => PriceCategory::Commodity->value, 'name' => 'Red Onion', 'value' => 135.00, 'unit' => 'per kg'],
        ];

        // Regional price multipliers: provinces often pay more for fuel/goods (transport cost).
        $regions = [
            'NCR' => 1.00,
            'Central Visayas' => 1.05,
            'Davao Region' => 0.97,
            'Cordillera (CAR)' => 1.09,
        ];

        foreach ($regions as $region => $multiplier) {
            foreach ($base as $item) {
                $prices->record([
                    ...$item,
                    'value' => round($item['value'] * $multiplier, 2),
                    'region' => $region,
                    'source' => 'Sample data (DOE / DTI / LTFRB reference)',
                ], null);
            }
        }

        // Seed a recent movement so the app shows trend + history per region.
        foreach (array_keys($regions) as $region) {
            $diesel = PriceReference::query()->where('name', 'Diesel')->where('region', $region)->first();
            if ($diesel !== null) {
                $prices->update($diesel, ['value' => round((float) $diesel->value + 1.50, 2)], null);
            }

            $rice = PriceReference::query()->where('name', 'Regular Milled Rice')->where('region', $region)->first();
            if ($rice !== null) {
                $prices->update($rice, ['value' => round((float) $rice->value - 2.00, 2)], null);
            }
        }
    }
}
