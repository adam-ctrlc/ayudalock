<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class EdgeCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_reads_are_cacheable_at_the_edge(): void
    {
        $this->getJson('/api/heatmap/outages')
            ->assertOk()
            ->assertHeader('Cache-Control', 'max-age=0, public, s-maxage=60, stale-while-revalidate=300');
    }

    public function test_slow_moving_reads_get_a_longer_window(): void
    {
        $this->getJson('/api/guides')
            ->assertOk()
            ->assertHeader('Cache-Control', 'max-age=0, public, s-maxage=300, stale-while-revalidate=1500');
    }

    public function test_authenticated_reads_are_never_edge_cached(): void
    {
        $scenario = $this->makeFoodScenario();

        $response = $this->withAuth($scenario['citizen'])->getJson('/api/locations')->assertOk();

        $this->assertStringNotContainsString('s-maxage', (string) $response->headers->get('Cache-Control'));
    }

    public function test_a_public_route_carrying_a_token_is_not_edge_cached(): void
    {
        $scenario = $this->makeFoodScenario();

        $response = $this->withAuth($scenario['citizen'])->getJson('/api/prices')->assertOk();

        $this->assertStringNotContainsString('s-maxage', (string) $response->headers->get('Cache-Control'));
    }

    public function test_writes_are_not_edge_cached(): void
    {
        $response = $this->withAuth($this->lguAdmin())->postJson('/api/prices', [
            'category' => 'fuel',
            'name' => 'Diesel',
            'value' => 132.5,
            'unit' => 'per liter',
            'region' => 'NCR',
        ]);

        $this->assertStringNotContainsString('s-maxage', (string) $response->headers->get('Cache-Control'));
    }

    public function test_head_requests_are_cacheable_like_get(): void
    {
        $this->call('HEAD', '/api/guides')
            ->assertOk()
            ->assertHeader('Cache-Control', 'max-age=0, public, s-maxage=300, stale-while-revalidate=1500');
    }

    public function test_unauthenticated_api_requests_return_401_not_a_login_redirect(): void
    {
        $this->withHeaders(['Accept' => 'text/html'])
            ->get('/api/programs')
            ->assertUnauthorized();

        $this->getJson('/api/locations')->assertUnauthorized();
    }

    public function test_the_internal_refresh_seam_is_not_edge_cached(): void
    {
        config(['services.energy.refresh_secret' => 'test-secret']);

        $response = $this->withHeader('Authorization', 'Bearer test-secret')
            ->getJson('/api/internal/energy/refresh')
            ->assertOk();

        $this->assertStringNotContainsString('s-maxage', (string) $response->headers->get('Cache-Control'));
    }
}
