<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            BarangaySeeder::class,
            ProgramSeeder::class,
            LocationSeeder::class,
            BeneficiarySeeder::class,
            FranchiseHolderSeeder::class,
            UserSeeder::class,
            PriceReferenceSeeder::class,
            AnnouncementSeeder::class,
        ]);
    }
}
