<?php

namespace Database\Factories;

use App\Models\Barangay;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Barangay>
 */
class BarangayFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Barangay '.fake()->unique()->numerify('###'),
            'city' => fake()->city(),
            'latitude' => fake()->latitude(14.0, 15.0),
            'longitude' => fake()->longitude(120.0, 121.5),
        ];
    }
}
