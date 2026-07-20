<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ResponderAgency;
use App\Models\ResponseTeam;
use Illuminate\Database\Seeder;

final class ResponseTeamSeeder extends Seeder
{
    public function run(): void
    {
        $teams = [
            ['name' => 'BFP Quezon City Station', 'agency' => ResponderAgency::Bfp, 'contact_number' => '(02) 8426-0219', 'province_code' => 'PH-MNL'],
            ['name' => 'BFP Caloocan Station', 'agency' => ResponderAgency::Bfp, 'contact_number' => '(02) 8288-8181', 'province_code' => 'PH-MNL'],
            ['name' => 'Coast Guard District NCR', 'agency' => ResponderAgency::Pcg, 'contact_number' => '(02) 8527-8481', 'province_code' => 'PH-MNL'],
            ['name' => 'PNP Quezon City Police District', 'agency' => ResponderAgency::Pnp, 'contact_number' => '117', 'province_code' => 'PH-MNL'],
            ['name' => 'Quezon City DRRMO', 'agency' => ResponderAgency::Drrmo, 'contact_number' => '(02) 8927-5914', 'province_code' => 'PH-MNL'],
            ['name' => 'Caloocan DRRMO', 'agency' => ResponderAgency::Drrmo, 'contact_number' => '(02) 8310-4500', 'province_code' => 'PH-MNL'],
            ['name' => 'NCR Emergency Medical Service', 'agency' => ResponderAgency::Ems, 'contact_number' => '911', 'province_code' => 'PH-MNL'],
            ['name' => 'DPWH NCR District Office', 'agency' => ResponderAgency::Dpwh, 'contact_number' => '(02) 8304-3000', 'province_code' => 'PH-MNL'],
            ['name' => 'Meralco Emergency Response', 'agency' => ResponderAgency::Utility, 'contact_number' => '16211', 'province_code' => 'PH-MNL'],
            ['name' => 'Philippine Navy Search and Rescue', 'agency' => ResponderAgency::Navy, 'contact_number' => '(02) 8524-2051', 'province_code' => null],
        ];

        foreach ($teams as $team) {
            ResponseTeam::query()->updateOrCreate(
                ['name' => $team['name']],
                [...$team, 'is_active' => true],
            );
        }
    }
}
