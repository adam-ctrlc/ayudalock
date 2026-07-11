<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson('/api/locations')->assertStatus(401);
    }

    public function test_citizen_cannot_redeem(): void
    {
        $citizen = User::factory()->citizen()->create();

        $this->withAuth($citizen)->postJson('/api/redemptions', ['sms_code' => '123456'])
            ->assertStatus(403);
    }

    public function test_merchant_cannot_view_dashboard(): void
    {
        $merchant = User::factory()->merchant()->create();

        $this->withAuth($merchant)->getJson('/api/dashboard/stats')->assertStatus(403);
    }

    public function test_citizen_cannot_view_dashboard(): void
    {
        $citizen = User::factory()->citizen()->create();

        $this->withAuth($citizen)->getJson('/api/dashboard/heatmap')->assertStatus(403);
    }
}
