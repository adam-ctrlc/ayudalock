<?php

namespace Database\Factories;

use App\Models\Commodity;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Commodity>
 */
class CommodityFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'program_id' => Program::factory(),
            'name' => fake()->word(),
            'unit' => 'kg',
        ];
    }
}
