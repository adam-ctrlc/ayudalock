<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\LocationType;
use App\Models\Barangay;
use App\Models\Commodity;
use App\Models\Inventory;
use App\Models\Location;
use Illuminate\Database\Seeder;

final class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $rice = Commodity::query()->where('name', 'Rice')->firstOrFail();
        $diesel = Commodity::query()->where('name', 'Diesel')->firstOrFail();

        foreach (Barangay::query()->get() as $barangay) {
            $kadiwa = Location::query()->firstOrCreate(
                ['name' => "Kadiwa ng Pangulo - {$barangay->name}", 'barangay_id' => $barangay->id],
                [
                    'type' => LocationType::KadiwaStore->value,
                    'latitude' => $barangay->latitude,
                    'longitude' => $barangay->longitude,
                    'is_active' => true,
                ],
            );

            Inventory::query()->firstOrCreate(
                ['location_id' => $kadiwa->id, 'commodity_id' => $rice->id],
                ['quantity_available' => 500, 'quantity_locked' => 0],
            );

            $station = Location::query()->firstOrCreate(
                ['name' => "Partner Fuel Station - {$barangay->name}", 'barangay_id' => $barangay->id],
                [
                    'type' => LocationType::GasStation->value,
                    'latitude' => $barangay->latitude,
                    'longitude' => $barangay->longitude,
                    'is_active' => true,
                ],
            );

            Inventory::query()->firstOrCreate(
                ['location_id' => $station->id, 'commodity_id' => $diesel->id],
                ['quantity_available' => 2000, 'quantity_locked' => 0],
            );
        }
    }
}
