<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Province;
use Illuminate\Database\Seeder;

final class ProvinceSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/provinces.json');

        if (! is_file($path)) {
            return;
        }

        /** @var array<int, array<string, mixed>> $provinces */
        $provinces = json_decode((string) file_get_contents($path), true) ?? [];

        foreach ($provinces as $province) {
            Province::updateOrCreate(
                ['code' => $province['code']],
                [
                    'name' => $province['name'],
                    'latitude' => $province['latitude'],
                    'longitude' => $province['longitude'],
                ],
            );
        }
    }
}
