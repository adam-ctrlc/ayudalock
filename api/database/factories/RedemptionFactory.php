<?php

namespace Database\Factories;

use App\Enums\RedemptionSource;
use App\Models\Allocation;
use App\Models\Location;
use App\Models\Redemption;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Redemption>
 */
class RedemptionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'allocation_id' => Allocation::factory(),
            'merchant_id' => User::factory()->merchant(),
            'location_id' => Location::factory(),
            'quantity' => 5,
            'source' => RedemptionSource::Online->value,
            'client_uuid' => null,
            'redeemed_at' => now(),
            'synced_at' => now(),
        ];
    }
}
