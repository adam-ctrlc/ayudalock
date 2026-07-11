<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\PriceReference;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class PriceTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_list_prices_without_authentication(): void
    {
        PriceReference::factory()->fuel()->count(2)->create();
        PriceReference::factory()->commodity()->count(3)->create();

        $this->getJson('/api/prices')
            ->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_prices_can_be_filtered_by_category(): void
    {
        PriceReference::factory()->fuel()->create(['name' => 'Diesel']);
        PriceReference::factory()->commodity()->create(['name' => 'Rice']);

        $this->getJson('/api/prices?category=fuel')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Diesel');
    }

    public function test_admin_update_records_history_and_sets_trend(): void
    {
        $admin = $this->lguAdmin();
        $price = PriceReference::factory()->fuel()->create(['name' => 'Diesel', 'value' => 50, 'previous_value' => null]);

        $response = $this->withAuth($admin)->putJson("/api/prices/{$price->id}", ['value' => 60]);

        $response->assertOk()
            ->assertJsonPath('data.value', fn ($v): bool => (float) $v === 60.0)
            ->assertJsonPath('data.previous_value', fn ($v): bool => (float) $v === 50.0)
            ->assertJsonPath('data.trend', 'up')
            ->assertJsonPath('data.change_percent', fn ($v): bool => (float) $v === 20.0);

        $this->assertDatabaseHas('price_reference_histories', [
            'price_reference_id' => $price->id,
            'value' => 60,
            'previous_value' => 50,
            'recorded_by' => $admin->id,
        ]);
    }

    public function test_admin_can_create_a_price(): void
    {
        $admin = $this->lguAdmin();

        $this->withAuth($admin)->postJson('/api/prices', [
            'category' => 'fare',
            'name' => 'Jeepney (first 4 km)',
            'value' => 13,
            'unit' => 'PHP',
        ])->assertCreated()->assertJsonPath('data.category', 'fare');

        $this->assertDatabaseHas('price_references', ['name' => 'Jeepney (first 4 km)']);
    }

    public function test_non_admin_cannot_write_prices(): void
    {
        $citizen = User::factory()->citizen()->create();
        $price = PriceReference::factory()->fuel()->create();

        $this->postJson('/api/prices', ['category' => 'fuel', 'name' => 'X', 'value' => 1, 'unit' => 'per liter'])
            ->assertStatus(401);

        $this->withAuth($citizen)->putJson("/api/prices/{$price->id}", ['value' => 99])
            ->assertStatus(403);
    }
}
