<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\LocationType;
use App\Enums\UserRole;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class UserSeeder extends Seeder
{
    public function run(): void
    {
        $kadiwa = Location::query()->where('type', LocationType::KadiwaStore->value)->first();

        User::query()->firstOrCreate(
            ['email' => 'citizen@ayudalock.test'],
            [
                'name' => 'Maria Santos',
                'username' => 'maria',
                'password' => Hash::make('password'),
                'role' => UserRole::Citizen->value,
                'phil_sys_id' => 'PSN-0001-0001-0001',
                'phone' => '09170000001',
            ],
        );

        User::query()->firstOrCreate(
            ['email' => 'driver@ayudalock.test'],
            [
                'name' => 'Jose Dela Cruz',
                'username' => 'jose',
                'password' => Hash::make('password'),
                'role' => UserRole::Citizen->value,
                'phil_sys_id' => 'PSN-0002-0002-0002',
                'phone' => '09170000002',
            ],
        );

        User::query()->firstOrCreate(
            ['email' => 'merchant@ayudalock.test'],
            [
                'name' => 'Kadiwa Vendor',
                'username' => 'kadiwa',
                'password' => Hash::make('password'),
                'role' => UserRole::Merchant->value,
                'phone' => '09170000003',
                'location_id' => $kadiwa?->id,
            ],
        );

        User::query()->firstOrCreate(
            ['email' => 'mayor@ayudalock.test'],
            [
                'name' => 'City DRRMO Admin',
                'username' => 'mayor',
                'password' => Hash::make('password'),
                'role' => UserRole::LguAdmin->value,
                'phone' => '09170000004',
            ],
        );
    }
}
