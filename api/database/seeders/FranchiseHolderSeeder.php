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
            ['license_number' => 'LTFRB-0000001'],
            [
                'phil_sys_id' => 'PSN-0002-0002-0002',
                'plate_number' => 'NGP-1234',
                'driver_name' => 'Jose Dela Cruz',
                'franchise_type' => 'jeepney',
                'barangay' => 'Barangay Commonwealth',
                'is_active' => true,
            ],
        );

        FranchiseHolder::query()->firstOrCreate(
            ['license_number' => 'LTFRB-0000002'],
            [
                'phil_sys_id' => 'PSN-0002-0002-0002',
                'plate_number' => 'NGP-1234',
                'driver_name' => 'Jose Dela Cruz Jr.',
                'franchise_type' => 'jeepney',
                'barangay' => 'Barangay Commonwealth',
                'is_active' => true,
            ],
        );

        FranchiseHolder::query()->firstOrCreate(
            ['license_number' => 'TNVS-0000003'],
            [
                'phil_sys_id' => 'PSN-0002-0002-0002',
                'plate_number' => 'NGP-1234',
                'driver_name' => 'J. Dela Cruz',
                'franchise_type' => 'tnvs',
                'barangay' => 'Barangay Commonwealth',
                'is_active' => true,
            ],
        );

        FranchiseHolder::factory()->count(10)->create();
    }
}
