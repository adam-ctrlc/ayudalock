<?php

namespace Database\Factories;

use App\Enums\PriceCategory;
use App\Models\PriceReference;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PriceReference>
 */
class PriceReferenceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category' => PriceCategory::Fuel->value,
            'name' => fake()->words(2, true),
            'value' => fake()->randomFloat(2, 10, 100),
            'unit' => 'per liter',
            'region' => 'NCR',
            'source' => 'Sample data',
            'effective_date' => now()->toDateString(),
            'previous_value' => null,
        ];
    }

    public function fuel(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => PriceCategory::Fuel->value,
            'unit' => 'per liter',
        ]);
    }

    public function fare(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => PriceCategory::Fare->value,
            'unit' => 'PHP',
        ]);
    }

    public function commodity(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => PriceCategory::Commodity->value,
            'unit' => 'per kg',
        ]);
    }
}
