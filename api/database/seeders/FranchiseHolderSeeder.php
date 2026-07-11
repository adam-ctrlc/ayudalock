<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\FranchiseHolder;
use Illuminate\Database\Seeder;

final class FranchiseHolderSeeder extends Seeder
{
    public function run(): void
    {
        FranchiseHolder::query()->firstOrCreate(
            ['phil_sys_id' => 'PSN-0002-0002-0002'],
            [
                'license_number' => 'LTFRB-0000001',
                'plate_number' => 'NGP-1234',
                'driver_name' => 'Jose Dela Cruz',
                'franchise_type' => 'jeepney',
                'barangay' => 'Barangay Commonwealth',
                'is_active' => true,
            ],
        );

        FranchiseHolder::factory()->count(10)->create();
    }
}
