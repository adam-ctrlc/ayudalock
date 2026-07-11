<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class OfflineBatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_offline_batch_sync_is_idempotent_on_client_uuid(): void
    {
        $scenario = $this->makeFoodScenario();

        $token = $this->withAuth($scenario['citizen'])->postJson('/api/allocations', [
            'location_id' => $scenario['location']->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => 5,
        ])->json('data.voucher.token');

        $clientUuid = '11111111-1111-4111-8111-111111111111';

        $payload = [
            'items' => [
                ['client_uuid' => $clientUuid, 'token' => $token, 'redeemed_at' => now()->subMinutes(30)->toIso8601String()],
            ],
        ];

        $first = $this->withAuth($scenario['merchant'])->postJson('/api/redemptions/batch', $payload);
        $first->assertOk()->assertJsonPath('results.0.status', 'accepted');

        $second = $this->withAuth($scenario['merchant'])->postJson('/api/redemptions/batch', $payload);
        $second->assertOk()->assertJsonPath('results.0.status', 'duplicate');

        $this->assertDatabaseCount('redemptions', 1);
        $this->assertDatabaseHas('redemptions', [
            'client_uuid' => $clientUuid,
            'source' => 'offline',
        ]);
    }
}
