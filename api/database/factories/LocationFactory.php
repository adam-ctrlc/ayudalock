<?php

namespace Database\Factories;

use App\Enums\LocationType;
use App\Models\Barangay;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Location>
 */
class LocationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'type' => LocationType::KadiwaStore->value,
            'barangay_id' => Barangay::factory(),
            'latitude' => fake()->latitude(14.0, 15.0),
            'longitude' => fake()->longitude(120.0, 121.5),
            'is_active' => true,
        ];
    }

    public function kadiwaStore(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => LocationType::KadiwaStore->value,
        ]);
    }

    public function gasStation(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => LocationType::GasStation->value,
        ]);
    }
}
