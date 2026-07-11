<?php

namespace Database\Factories;

use App\Models\Commodity;
use App\Models\Inventory;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inventory>
 */
class InventoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'location_id' => Location::factory(),
            'commodity_id' => Commodity::factory(),
            'quantity_available' => 500,
            'quantity_locked' => 0,
        ];
    }
}
