<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Barangay;
use Illuminate\Database\Seeder;

final class BarangaySeeder extends Seeder
{
    public function run(): void
    {
        $barangays = [
            ['name' => 'Barangay 176', 'city' => 'Caloocan', 'latitude' => 14.7566, 'longitude' => 120.9847],
            ['name' => 'Barangay Commonwealth', 'city' => 'Quezon City', 'latitude' => 14.6870, 'longitude' => 121.0880],
            ['name' => 'Barangay Bagong Silang', 'city' => 'Caloocan', 'latitude' => 14.7620, 'longitude' => 121.0400],
        ];

        foreach ($barangays as $barangay) {
            Barangay::query()->firstOrCreate(
                ['name' => $barangay['name'], 'city' => $barangay['city']],
                $barangay,
            );
        }
    }
}
