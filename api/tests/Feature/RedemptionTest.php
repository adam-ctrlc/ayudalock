<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\AllocationStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

final class RedemptionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $scenario
     */
    private function lock(array $scenario, float $quantity = 5): TestResponse
    {
        return $this->withAuth($scenario['citizen'])->postJson('/api/allocations', [
            'location_id' => $scenario['location']->id,
            'commodity_id' => $scenario['commodity']->id,
            'quantity' => $quantity,
        ]);
    }

    public function test_merchant_redeems_a_voucher_by_token(): void
    {
        $scenario = $this->makeFoodScenario();
        $lock = $this->lock($scenario);
        $token = $lock->json('data.voucher.token');
        $allocationId = $lock->json('data.id');

        $this->withAuth($scenario['merchant'])->postJson('/api/redemptions', [
            'token' => $token,
        ])->assertCreated()->assertJsonPath('data.source', 'online');

        $this->assertDatabaseHas('allocations', [
            'id' => $allocationId,
            'status' => AllocationStatus::Redeemed->value,
        ]);

        $this->assertDatabaseHas('inventories', [
            'location_id' => $scenario['location']->id,
            'quantity_locked' => 0,
        ]);
    }

    public function test_merchant_redeems_a_voucher_by_sms_code(): void
    {
        $scenario = $this->makeFoodScenario();
        $smsCode = $this->lock($scenario)->json('data.voucher.sms_code');

        $this->withAuth($scenario['merchant'])->postJson('/api/redemptions', [
            'sms_code' => $smsCode,
        ])->assertCreated();
    }

    public function test_a_voucher_cannot_be_redeemed_twice(): void
    {
        $scenario = $this->makeFoodScenario();
        $token = $this->lock($scenario)->json('data.voucher.token');

        $this->withAuth($scenario['merchant'])->postJson('/api/redemptions', ['token' => $token])->assertCreated();

        $this->withAuth($scenario['merchant'])->postJson('/api/redemptions', ['token' => $token])->assertStatus(409);
    }

    public function test_expired_voucher_is_rejected(): void
    {
        $scenario = $this->makeFoodScenario();
        $token = $this->lock($scenario)->json('data.voucher.token');

        $this->withAuth($scenario['merchant']);
        $this->travel(121)->minutes();

        $this->postJson('/api/redemptions', ['token' => $token])->assertStatus(422);
    }

    public function test_merchant_cannot_redeem_a_voucher_from_another_location(): void
    {
        $scenario = $this->makeFoodScenario();
        $token = $this->lock($scenario)->json('data.voucher.token');

        $otherMerchant = User::factory()->merchant()->create();

        $this->withAuth($otherMerchant)->postJson('/api/redemptions', ['token' => $token])->assertStatus(403);
    }
}
