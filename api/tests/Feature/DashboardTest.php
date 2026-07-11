<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_lgu_admin_sees_heatmap_and_stats(): void
    {
        $scenario = $this->makeFoodScenario(['stock' => 100]);
        $admin = $this->lguAdmin();

        $token = $this->withAuth($scenario['citizen'])->postJson('/api/allocations', [
            'location_id' => $scenario['location']->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 5,
        ])->json('data.voucher.token');

        $this->withAuth($scenario['merchant'])->postJson('/api/redemptions', ['token' => $token])->assertCreated();

        $heatmap = $this->withAuth($admin)->getJson('/api/dashboard/heatmap');
        $heatmap->assertOk()
            ->assertJsonPath('data.0.barangay_id', $scenario['barangay']->id)
            ->assertJsonPath('data.0.redeemed', fn ($value): bool => (float) $value === 5.0);

        $stats = $this->withAuth($admin)->getJson('/api/dashboard/stats');
        $stats->assertOk()
            ->assertJsonPath('redemptions.count', 1)
            ->assertJsonPath('redemptions.quantity', fn ($value): bool => (float) $value === 5.0);
    }
}
