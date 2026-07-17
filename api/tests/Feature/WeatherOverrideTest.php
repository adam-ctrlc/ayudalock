<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\WeatherSource;
use App\Models\Province;
use App\Services\Hazard\WeatherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

final class WeatherOverrideTest extends TestCase
{
    use RefreshDatabase;

    private function province(string $code = 'PH-MNL'): Province
    {
        return Province::query()->create([
            'code' => $code,
            'name' => 'Metropolitan Manila',
            'latitude' => 14.4414,
            'longitude' => 121.0,
            'precipitation' => 0.0,
            'temperature' => 30.0,
            'weather_updated_at' => now()->subDay(),
        ]);
    }

    private function fakeUpstream(float $precipitation): void
    {
        Http::fake([
            'api.open-meteo.com/*' => Http::response([
                'current' => [
                    'temperature_2m' => 31.0,
                    'precipitation' => $precipitation,
                    'weather_code' => 61,
                    'wind_speed_10m' => 12.0,
                ],
            ]),
        ]);
    }

    public function test_a_manual_override_is_not_overwritten_by_the_next_refresh(): void
    {
        $province = $this->province();
        $this->fakeUpstream(0.2);

        $this->withAuth($this->lguAdmin())->putJson('/api/heatmap/weather/PH-MNL', [
            'precipitation' => 88.5,
            'weather_description' => 'Heavy flooding reported',
            'weather_note' => 'PAGASA station reading relayed by DRRMO',
        ])->assertOk()->assertJsonPath('data.is_live', false);

        app(WeatherService::class)->refresh();

        $province->refresh();

        $this->assertSame(88.5, (float) $province->precipitation);
        $this->assertSame(WeatherSource::Manual, $province->weather_source);
    }

    public function test_live_provinces_still_refresh_normally(): void
    {
        $province = $this->province('PH-CEB');
        $this->fakeUpstream(4.5);

        app(WeatherService::class)->refresh();

        $this->assertSame(4.5, (float) $province->fresh()->precipitation);
        $this->assertSame(WeatherSource::OpenMeteo, $province->fresh()->weather_source);
    }

    public function test_an_override_must_declare_where_the_reading_came_from(): void
    {
        $this->province();

        $this->withAuth($this->lguAdmin())->putJson('/api/heatmap/weather/PH-MNL', [
            'precipitation' => 88.5,
        ])->assertStatus(422)->assertJsonValidationErrors('weather_note');
    }

    public function test_clearing_the_override_resumes_live_data(): void
    {
        $province = $this->province();
        $this->fakeUpstream(3.3);

        $this->withAuth($this->lguAdmin())->putJson('/api/heatmap/weather/PH-MNL', [
            'precipitation' => 88.5,
            'weather_note' => 'Field report',
        ])->assertOk();

        $this->withAuth($this->lguAdmin())
            ->deleteJson('/api/heatmap/weather/PH-MNL')
            ->assertOk();

        $province->refresh();

        $this->assertSame(WeatherSource::OpenMeteo, $province->weather_source);
        $this->assertSame(3.3, (float) $province->precipitation);
        $this->assertNull($province->weather_note);
    }

    public function test_only_admin_can_override_weather(): void
    {
        $scenario = $this->makeFoodScenario();
        $this->province();

        $this->withAuth($scenario['citizen'])->putJson('/api/heatmap/weather/PH-MNL', [
            'precipitation' => 88.5,
            'weather_note' => 'Nope',
        ])->assertForbidden();
    }

    public function test_the_public_feed_shows_that_a_value_is_manual(): void
    {
        $this->province();
        $this->fakeUpstream(0.1);

        $this->withAuth($this->lguAdmin())->putJson('/api/heatmap/weather/PH-MNL', [
            'precipitation' => 88.5,
            'weather_note' => 'PAGASA station reading',
        ])->assertOk();

        $this->getJson('/api/heatmap/weather')
            ->assertOk()
            ->assertJsonPath('data.0.source', 'manual')
            ->assertJsonPath('data.0.is_live', false)
            ->assertJsonPath('data.0.note', 'PAGASA station reading');
    }
}
