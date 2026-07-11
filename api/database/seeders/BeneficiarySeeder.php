<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Beneficiary;
use Illuminate\Database\Seeder;

final class BeneficiarySeeder extends Seeder
{
    public function run(): void
    {
        Beneficiary::query()->firstOrCreate(
            ['phil_sys_id' => 'PSN-0001-0001-0001'],
            [
                'dswd_id' => 'DSWD-000001',
                'household_number' => 'HH-00001',
                'full_name' => 'Maria Santos',
                'barangay' => 'Barangay 176',
                'poverty_status' => 'poor',
                'is_active' => true,
            ],
        );

        Beneficiary::factory()->count(20)->create();
    }
}
