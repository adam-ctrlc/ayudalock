<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\LocationType;
use App\Models\Inventory;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ReliefAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_service_point(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($this->lguAdmin())->postJson('/api/locations', [
            'name' => 'Kadiwa ng Pangulo - New Site',
            'type' => LocationType::KadiwaStore->value,
            'barangay_id' => $scenario['barangay']->id,
            'latitude' => 14.65,
            'longitude' => 121.05,
            'is_active' => true,
            'has_generator' => true,
        ])->assertCreated()->assertJsonPath('data.has_generator', true);

        $this->assertDatabaseHas('locations', ['name' => 'Kadiwa ng Pangulo - New Site']);
    }

    public function test_citizen_cannot_create_a_service_point(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($scenario['citizen'])->postJson('/api/locations', [
            'name' => 'Rogue Store',
            'type' => LocationType::KadiwaStore->value,
            'barangay_id' => $scenario['barangay']->id,
        ])->assertForbidden();

        $this->assertDatabaseMissing('locations', ['name' => 'Rogue Store']);
    }

    public function test_admin_can_restock_without_touching_locked_stock(): void
    {
        $scenario = $this->makeFoodScenario(['stock' => 10]);

        $inventory = $scenario['inventory'];
        $inventory->quantity_locked = 4;
        $inventory->save();

        $this->withAuth($this->lguAdmin())->postJson(
            "/api/locations/{$scenario['location']->id}/restock",
            ['commodity_id' => $scenario['commodity']->id, 'quantity_available' => 500],
        )->assertOk()->assertJsonPath('data.quantity_available', 500);

        $this->assertDatabaseHas('inventories', [
            'id' => $inventory->id,
            'quantity_available' => 500,
            'quantity_locked' => 4,
        ]);
    }

    public function test_restock_creates_the_row_when_the_commodity_is_new_to_the_site(): void
    {
        $scenario = $this->makeFoodScenario();

        $empty = Location::factory()->kadiwaStore()->create([
            'barangay_id' => $scenario['barangay']->id,
        ]);

        $this->withAuth($this->lguAdmin())->postJson("/api/locations/{$empty->id}/restock", [
            'commodity_id' => $scenario['commodity']->id,
            'quantity_available' => 250,
        ])->assertCreated();

        $this->assertDatabaseHas('inventories', [
            'location_id' => $empty->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity_available' => 250,
        ]);
    }

    public function test_a_service_point_with_locked_vouchers_cannot_be_deleted(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($scenario['citizen'])->postJson('/api/allocations', [
            'location_id' => $scenario['location']->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 2,
        ])->assertCreated();

        $response = $this->withAuth($this->lguAdmin())
            ->deleteJson("/api/locations/{$scenario['location']->id}");

        $response->assertStatus(422);
        $this->assertStringContainsString('still locked', $response->json('message'));

        $this->assertDatabaseHas('locations', ['id' => $scenario['location']->id]);
    }

    public function test_an_unused_service_point_can_be_deleted(): void
    {
        $scenario = $this->makeFoodScenario();

        $spare = Location::factory()->kadiwaStore()->create([
            'barangay_id' => $scenario['barangay']->id,
        ]);

        $this->withAuth($this->lguAdmin())
            ->deleteJson("/api/locations/{$spare->id}")
            ->assertOk();

        $this->assertDatabaseMissing('locations', ['id' => $spare->id]);
    }

    public function test_admin_can_change_a_program_cap(): void
    {
        $scenario = $this->makeFoodScenario(['cap' => 5]);

        $this->withAuth($this->lguAdmin())->putJson("/api/programs/{$scenario['program']->id}", [
            'per_beneficiary_cap' => 25,
        ])->assertOk()->assertJsonPath('data.per_beneficiary_cap', 25);

        $this->withAuth($scenario['citizen'])->postJson('/api/allocations', [
            'location_id' => $scenario['location']->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 20,
        ])->assertCreated();
    }

    public function test_only_admin_can_list_programs(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($scenario['citizen'])->getJson('/api/programs')->assertForbidden();
        $this->withAuth($this->lguAdmin())->getJson('/api/programs')->assertOk();
    }
}
