<?php

namespace Database\Factories;

use App\Models\Allocation;
use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Voucher>
 */
class VoucherFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'allocation_id' => Allocation::factory(),
            'token' => Str::random(64),
            'qr_payload' => Str::random(64),
            'sms_code' => (string) fake()->unique()->numberBetween(100000, 999999),
            'expires_at' => now()->addHours(2),
            'redeemed_at' => null,
        ];
    }
}
