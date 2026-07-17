<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\GridIsland;
use App\Enums\GridLevel;
use App\Enums\InterruptionStatus;
use App\Enums\InterruptionType;
use App\Enums\PowerStatus;
use App\Models\PowerInterruption;
use App\Models\Province;
use App\Services\Energy\EnergyImpactService;
use App\Services\Energy\GridLocator;
use App\Services\Energy\GridStatusService;
use App\Services\Energy\OutageAggregator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class EnergyTest extends TestCase
{
    use RefreshDatabase;

    public function test_grid_level_is_derived_from_reserve_margin(): void
    {
        $service = new GridStatusService();

        $this->assertSame(GridLevel::Red, $service->levelFor(10_000, 10_100));
        $this->assertSame(GridLevel::Red, $service->levelFor(10_000, 9_900));
        $this->assertSame(GridLevel::Yellow, $service->levelFor(10_000, 9_500));
        $this->assertSame(GridLevel::Normal, $service->levelFor(10_000, 9_000));
    }

    public function test_grid_membership_is_not_latitudinal(): void
    {
        $locator = new GridLocator();

        $this->assertSame(GridIsland::Mindanao, $locator->forProvince('PH-CAM'));
        $this->assertSame(GridIsland::Visayas, $locator->forProvince('PH-SIG'));
        $this->assertSame(GridIsland::Mindanao, $locator->forProvince('PH-SUN'));
        $this->assertSame(GridIsland::Visayas, $locator->forProvince('PH-NER'));
        $this->assertSame(GridIsland::Mindanao, $locator->forProvince('PH-DIN'));
        $this->assertSame(GridIsland::Luzon, $locator->forProvince('PH-PLW'));
        $this->assertSame(GridIsland::Luzon, $locator->forProvince('PH-MAS'));
        $this->assertSame(GridIsland::Luzon, $locator->forProvince('PH-ROM'));
        $this->assertSame(GridIsland::Luzon, $locator->forProvince(null));
    }

    public function test_interruption_only_covers_its_own_window(): void
    {
        $interruption = new PowerInterruption([
            'starts_at' => now()->addHour(),
            'ends_at' => now()->addHours(3),
        ]);

        $this->assertFalse($interruption->coversMoment(now()));
        $this->assertTrue($interruption->coversMoment(now()->addHours(2)));
        $this->assertFalse($interruption->coversMoment(now()->addHours(4)));
    }

    public function test_active_store_goes_dark_and_generator_store_keeps_serving(): void
    {
        $scenario = $this->makeFoodScenario();
        $location = $scenario['location'];
        $barangay = $location->barangay;

        PowerInterruption::query()->create([
            'type' => InterruptionType::Rotating,
            'status' => InterruptionStatus::Announced,
            'utility' => 'Meralco',
            'province_code' => $barangay->province_code,
            'barangay_id' => $barangay->id,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
        ]);

        $impact = app(EnergyImpactService::class);
        $impact->syncPowerStatus();

        $this->assertSame(PowerStatus::Offline, $location->fresh()->power_status);

        $location->has_generator = true;
        $location->save();
        $impact->syncPowerStatus();

        $this->assertSame(PowerStatus::Generator, $location->fresh()->power_status);
    }

    public function test_store_serves_again_once_the_brownout_window_passes(): void
    {
        $scenario = $this->makeFoodScenario();
        $location = $scenario['location'];
        $barangay = $location->barangay;

        PowerInterruption::query()->create([
            'type' => InterruptionType::Rotating,
            'status' => InterruptionStatus::Announced,
            'utility' => 'Meralco',
            'province_code' => $barangay->province_code,
            'barangay_id' => $barangay->id,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
        ]);

        app(EnergyImpactService::class)->syncPowerStatus();

        $this->assertSame(PowerStatus::Offline, $location->fresh()->power_status);

        $this->withAuth($scenario['citizen']);

        $this->postJson('/api/allocations', [
            'location_id' => $location->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 1,
        ])->assertStatus(422);

        $this->travelTo(now()->addHours(2));

        $this->postJson('/api/allocations', [
            'location_id' => $location->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 1,
        ])->assertCreated();
    }

    public function test_store_goes_dark_when_a_scheduled_window_opens(): void
    {
        $scenario = $this->makeFoodScenario();
        $location = $scenario['location'];
        $barangay = $location->barangay;

        PowerInterruption::query()->create([
            'type' => InterruptionType::Scheduled,
            'status' => InterruptionStatus::Announced,
            'utility' => 'Meralco',
            'province_code' => $barangay->province_code,
            'barangay_id' => $barangay->id,
            'starts_at' => now()->addHours(2),
            'ends_at' => now()->addHours(5),
        ]);

        $this->withAuth($scenario['citizen']);

        $this->postJson('/api/allocations', [
            'location_id' => $location->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 1,
        ])->assertCreated();

        $this->travelTo(now()->addHours(3));

        $this->postJson('/api/allocations', [
            'location_id' => $location->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 1,
        ])->assertStatus(422);
    }

    public function test_claiming_is_blocked_at_a_dark_store(): void
    {
        $scenario = $this->makeFoodScenario();
        $location = $scenario['location'];

        PowerInterruption::query()->create([
            'type' => InterruptionType::Rotating,
            'status' => InterruptionStatus::Announced,
            'utility' => 'Meralco',
            'province_code' => $location->barangay->province_code,
            'barangay_id' => $location->barangay_id,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
        ]);

        $response = $this->withAuth($scenario['citizen'])->postJson('/api/allocations', [
            'location_id' => $location->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('power interruption', $response->json('message'));

        $this->assertDatabaseHas('inventories', [
            'location_id' => $location->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity_locked' => 0,
        ]);
    }

    public function test_claiming_still_works_on_generator_power(): void
    {
        $scenario = $this->makeFoodScenario();
        $location = $scenario['location'];

        $location->has_generator = true;
        $location->save();

        PowerInterruption::query()->create([
            'type' => InterruptionType::Rotating,
            'status' => InterruptionStatus::Announced,
            'utility' => 'Meralco',
            'province_code' => $location->barangay->province_code,
            'barangay_id' => $location->barangay_id,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
        ]);

        $this->withAuth($scenario['citizen'])->postJson('/api/allocations', [
            'location_id' => $location->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 2,
        ])->assertCreated();
    }

    public function test_outage_heatmap_returns_every_province_including_unaffected(): void
    {
        foreach ([['PH-MNL', 'Metropolitan Manila'], ['PH-CEB', 'Cebu'], ['PH-DAV', 'Davao del Norte']] as [$code, $name]) {
            Province::query()->create(['code' => $code, 'name' => $name, 'latitude' => 14.0, 'longitude' => 121.0]);
        }

        PowerInterruption::query()->create([
            'type' => InterruptionType::Rotating,
            'status' => InterruptionStatus::Announced,
            'utility' => 'Meralco',
            'province_code' => 'PH-MNL',
            'households_affected' => 4_200,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
        ]);

        $rows = (new OutageAggregator())->perProvince(24);

        $this->assertCount(3, $rows);

        $byCode = collect($rows)->keyBy('code');

        $this->assertSame(4_200, $byCode['PH-MNL']['households_affected']);
        $this->assertTrue($byCode['PH-MNL']['is_active']);
        $this->assertSame(0, $byCode['PH-CEB']['households_affected']);
        $this->assertFalse($byCode['PH-CEB']['is_active']);
    }

    public function test_public_can_read_grid_and_interruptions(): void
    {
        $this->getJson('/api/energy/grid')->assertOk();
        $this->getJson('/api/energy/interruptions')->assertOk();
        $this->getJson('/api/heatmap/outages')->assertOk()->assertJsonStructure(['data']);
    }

    public function test_only_lgu_admin_can_declare_an_interruption(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($scenario['citizen'])->postJson('/api/energy/interruptions', [
            'type' => InterruptionType::Rotating->value,
            'utility' => 'Meralco',
            'starts_at' => now()->toIso8601String(),
            'ends_at' => now()->addHours(2)->toIso8601String(),
        ])->assertForbidden();

        $this->withAuth($this->lguAdmin())->postJson('/api/energy/interruptions', [
            'type' => InterruptionType::Rotating->value,
            'utility' => 'Meralco',
            'barangay_id' => $scenario['location']->barangay_id,
            'starts_at' => now()->toIso8601String(),
            'ends_at' => now()->addHours(2)->toIso8601String(),
        ])->assertCreated();
    }

    public function test_energy_refresh_is_rejected_without_the_secret(): void
    {
        config(['services.energy.refresh_secret' => 'test-secret']);

        $this->getJson('/api/internal/energy/refresh')->assertForbidden();
        $this->getJson('/api/internal/energy/refresh?token=wrong')->assertForbidden();
    }

    public function test_energy_refresh_is_disabled_when_no_secret_is_configured(): void
    {
        config(['services.energy.refresh_secret' => null]);

        $this->getJson('/api/internal/energy/refresh?token=anything')->assertForbidden();
    }

    public function test_energy_refresh_restores_power_status(): void
    {
        config(['services.energy.refresh_secret' => 'test-secret']);

        $scenario = $this->makeFoodScenario();
        $location = $scenario['location'];

        PowerInterruption::query()->create([
            'type' => InterruptionType::Rotating,
            'status' => InterruptionStatus::Announced,
            'utility' => 'Meralco',
            'province_code' => $location->barangay->province_code,
            'barangay_id' => $location->barangay_id,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
        ]);

        app(EnergyImpactService::class)->syncPowerStatus();
        $this->assertSame(PowerStatus::Offline, $location->fresh()->power_status);

        $this->travelTo(now()->addHours(2));

        $this->withHeader('Authorization', 'Bearer test-secret')
            ->postJson('/api/internal/energy/refresh')
            ->assertOk()
            ->assertJsonStructure(['power_status_changed', 'allocations_released']);

        $this->assertSame(PowerStatus::Online, $location->fresh()->power_status);
    }

    public function test_interruption_must_end_after_it_starts(): void
    {
        $this->withAuth($this->lguAdmin())->postJson('/api/energy/interruptions', [
            'type' => InterruptionType::Rotating->value,
            'utility' => 'Meralco',
            'starts_at' => now()->addHours(2)->toIso8601String(),
            'ends_at' => now()->toIso8601String(),
        ])->assertStatus(422);
    }
}
