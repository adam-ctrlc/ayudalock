<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\IncidentType;
use App\Enums\LocationSource;
use App\Enums\ReportStatus;
use App\Models\IncidentReport;
use App\Models\Province;
use App\Models\User;
use App\Services\Hazard\HazardAggregator;
use App\Services\Incident\IncidentReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class IncidentReportTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'type' => IncidentType::Flood->value,
            'title' => 'Waist-deep flooding on Commonwealth Ave',
            'description' => 'The southbound lane is impassable and rising.',
            'location_source' => LocationSource::Gps->value,
            'latitude' => 14.687,
            'longitude' => 121.088,
            'accuracy_meters' => 12,
            ...$overrides,
        ];
    }

    public function test_a_citizen_can_submit_a_report(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($scenario['citizen'])
            ->postJson('/api/incident-reports', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.status', ReportStatus::Submitted->value)
            ->assertJsonPath('data.type', IncidentType::Flood->value);

        $this->assertDatabaseHas('incident_reports', [
            'user_id' => $scenario['citizen']->id,
            'status' => ReportStatus::Submitted->value,
        ]);
    }

    public function test_a_reporter_cannot_set_their_own_severity(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($scenario['citizen'])
            ->postJson('/api/incident-reports', $this->payload(['severity' => 100]))
            ->assertCreated()
            ->assertJsonPath('data.severity', null);
    }

    public function test_a_report_needs_a_location(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($scenario['citizen'])->postJson('/api/incident-reports', [
            'type' => IncidentType::Fire->value,
            'title' => 'Smoke seen nearby',
            'description' => 'No location given.',
            'location_source' => LocationSource::ManualProvince->value,
        ])->assertStatus(422)->assertJsonValidationErrors('province_code');
    }

    public function test_a_citizen_sees_only_their_own_reports(): void
    {
        $scenario = $this->makeFoodScenario();

        $stranger = User::factory()->create(['role' => $this->citizenType()]);

        $this->withAuth($stranger)
            ->postJson('/api/incident-reports', $this->payload(['title' => 'Someone else report']))
            ->assertCreated();

        $this->withAuth($scenario['citizen'])
            ->postJson('/api/incident-reports', $this->payload(['title' => 'My own report']))
            ->assertCreated();

        $response = $this->withAuth($scenario['citizen'])->getJson('/api/incident-reports')->assertOk();

        $titles = array_column($response->json('data'), 'title');

        $this->assertSame(['My own report'], $titles);
    }

    public function test_an_admin_sees_every_report(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($scenario['citizen'])
            ->postJson('/api/incident-reports', $this->payload())
            ->assertCreated();

        $this->withAuth($this->lguAdmin())
            ->getJson('/api/incident-reports')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_a_citizen_cannot_view_another_reporters_report(): void
    {
        $scenario = $this->makeFoodScenario();
        $stranger = User::factory()->create(['role' => $this->citizenType()]);

        $id = $this->withAuth($stranger)
            ->postJson('/api/incident-reports', $this->payload())
            ->json('data.id');

        $this->withAuth($scenario['citizen'])
            ->getJson("/api/incident-reports/{$id}")
            ->assertForbidden();
    }

    public function test_lists_omit_the_photo_but_the_detail_returns_it(): void
    {
        $scenario = $this->makeFoodScenario();
        $photo = 'data:image/jpeg;base64,'.str_repeat('A', 500);

        $id = $this->withAuth($scenario['citizen'])
            ->postJson('/api/incident-reports', $this->payload(['photo_thumbnail' => $photo]))
            ->assertCreated()
            ->json('data.id');

        $list = $this->withAuth($scenario['citizen'])->getJson('/api/incident-reports')->assertOk();
        $this->assertTrue($list->json('data.0.has_photo'));
        $this->assertArrayNotHasKey('photo_thumbnail', $list->json('data.0'));

        $this->withAuth($scenario['citizen'])
            ->getJson("/api/incident-reports/{$id}")
            ->assertOk()
            ->assertJsonPath('data.photo_thumbnail', $photo);
    }

    public function test_an_oversized_photo_is_rejected(): void
    {
        $scenario = $this->makeFoodScenario();

        $this->withAuth($scenario['citizen'])->postJson('/api/incident-reports', $this->payload([
            'photo_thumbnail' => 'data:image/jpeg;base64,'.str_repeat('A', 200001),
        ]))->assertStatus(422)->assertJsonValidationErrors('photo_thumbnail');
    }

    public function test_an_unreviewed_report_stays_off_the_public_impact_map(): void
    {
        Province::query()->create([
            'code' => 'PH-MNL',
            'name' => 'Metropolitan Manila',
            'latitude' => 14.4414,
            'longitude' => 121.0,
        ]);

        $scenario = $this->makeFoodScenario();

        $report = app(IncidentReportService::class)->submit(
            $scenario['citizen'],
            [
                ...$this->payload(),
                'type' => IncidentType::Flood,
                'location_source' => LocationSource::Gps,
                'province_code' => 'PH-MNL',
            ],
        );

        $before = collect((new HazardAggregator())->perProvince(30))->firstWhere('code', 'PH-MNL');

        $this->assertSame(0, $before['event_count']);

        app(IncidentReportService::class)->promote($report, $this->lguAdmin());

        $after = collect((new HazardAggregator())->perProvince(30))->firstWhere('code', 'PH-MNL');

        $this->assertSame(1, $after['event_count']);

        $this->assertDatabaseHas('hazard_events', [
            'source' => 'citizen_report',
            'province_code' => 'PH-MNL',
        ]);

        $this->assertSame(ReportStatus::Verified, $report->fresh()->status);
    }

    public function test_a_dismissed_report_cannot_be_published(): void
    {
        $scenario = $this->makeFoodScenario();

        $report = IncidentReport::query()->create([
            'user_id' => $scenario['citizen']->id,
            'type' => IncidentType::Flood,
            'status' => ReportStatus::Dismissed,
            'title' => 'Duplicate of an earlier report',
            'description' => 'Already handled.',
            'location_source' => LocationSource::ManualProvince,
        ]);

        $this->withAuth($this->lguAdmin())
            ->postJson("/api/incident-reports/{$report->id}/promote")
            ->assertStatus(422);

        $this->assertDatabaseCount('hazard_events', 0);
    }

    public function test_only_an_admin_can_review_or_publish(): void
    {
        $scenario = $this->makeFoodScenario();

        $id = $this->withAuth($scenario['citizen'])
            ->postJson('/api/incident-reports', $this->payload())
            ->json('data.id');

        $this->withAuth($scenario['citizen'])
            ->putJson("/api/incident-reports/{$id}", ['severity' => 80])
            ->assertForbidden();

        $this->withAuth($scenario['citizen'])
            ->postJson("/api/incident-reports/{$id}/promote")
            ->assertForbidden();
    }
}
