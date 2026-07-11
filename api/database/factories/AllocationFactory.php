<?php

namespace Database\Factories;

use App\Enums\AllocationStatus;
use App\Models\Allocation;
use App\Models\Commodity;
use App\Models\Location;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Allocation>
 */
class AllocationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'location_id' => Location::factory(),
            'commodity_id' => Commodity::factory(),
            'program_id' => Program::factory(),
            'quantity' => 5,
            'status' => AllocationStatus::Locked->value,
            'expires_at' => now()->addHours(2),
        ];
    }

    public function redeemed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AllocationStatus::Redeemed->value,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AllocationStatus::Locked->value,
            'expires_at' => now()->subHour(),
        ]);
    }
}
