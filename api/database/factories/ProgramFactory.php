<?php

namespace Database\Factories;

use App\Enums\ProgramType;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Program>
 */
class ProgramFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'type' => ProgramType::Food->value,
            'unit' => 'kg',
            'per_beneficiary_cap' => 5,
            'is_active' => true,
        ];
    }

    public function food(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => ProgramType::Food->value,
            'unit' => 'kg',
        ]);
    }

    public function fuel(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => ProgramType::Fuel->value,
            'unit' => 'liter',
            'per_beneficiary_cap' => 10,
        ]);
    }
}
