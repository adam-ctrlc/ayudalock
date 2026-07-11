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
        $samples = [
            ['category' => PriceCategory::Fuel->value, 'name' => 'Diesel', 'value' => 58.75, 'unit' => 'per liter'],
            ['category' => PriceCategory::Fuel->value, 'name' => 'Gasoline (RON95)', 'value' => 63.40, 'unit' => 'per liter'],
            ['category' => PriceCategory::Fuel->value, 'name' => 'Kerosene', 'value' => 71.20, 'unit' => 'per liter'],

            ['category' => PriceCategory::Fare->value, 'name' => 'Jeepney (first 4 km)', 'value' => 13.00, 'unit' => 'PHP'],
            ['category' => PriceCategory::Fare->value, 'name' => 'Ordinary Bus (first 5 km)', 'value' => 15.00, 'unit' => 'PHP'],
            ['category' => PriceCategory::Fare->value, 'name' => 'Tricycle (first km)', 'value' => 12.00, 'unit' => 'PHP'],
            ['category' => PriceCategory::Fare->value, 'name' => 'UV Express (first 4 km)', 'value' => 15.00, 'unit' => 'PHP'],

            ['category' => PriceCategory::Commodity->value, 'name' => 'Regular Milled Rice', 'value' => 50.00, 'unit' => 'per kg'],
            ['category' => PriceCategory::Commodity->value, 'name' => 'Well Milled Rice', 'value' => 54.00, 'unit' => 'per kg'],
            ['category' => PriceCategory::Commodity->value, 'name' => 'Brown Sugar', 'value' => 88.00, 'unit' => 'per kg'],
            ['category' => PriceCategory::Commodity->value, 'name' => 'Cooking Oil (1L)', 'value' => 95.00, 'unit' => 'per bottle'],
            ['category' => PriceCategory::Commodity->value, 'name' => 'Red Onion', 'value' => 120.00, 'unit' => 'per kg'],
        ];

        foreach ($samples as $sample) {
            $prices->record([...$sample, 'region' => 'NCR', 'source' => 'Sample data (DOE / DTI / LTFRB reference)'], null);
        }

        $diesel = PriceReference::query()->where('name', 'Diesel')->first();
        if ($diesel !== null) {
            $prices->update($diesel, ['value' => 60.25], null);
        }

        $rice = PriceReference::query()->where('name', 'Regular Milled Rice')->first();
        if ($rice !== null) {
            $prices->update($rice, ['value' => 48.00], null);
        }
    }
}
