<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\IncidentType;
use App\Enums\LocationSource;
use App\Enums\ReferralStatus;
use App\Enums\ResponderAgency;
use App\Models\IncidentReport;
use App\Models\Referral;
use App\Models\ResponseTeam;
use App\Services\Incident\ResponderMatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ReferralTest extends TestCase
{
    use RefreshDatabase;

    private function report(IncidentType $type = IncidentType::Fire): IncidentReport
    {
        $scenario = $this->makeFoodScenario();

        $id = $this->withAuth($scenario['citizen'])->postJson('/api/incident-reports', [
            'type' => $type->value,
            'title' => 'Test incident',
            'description' => 'Something is happening.',
            'location_source' => LocationSource::Gps->value,
            'latitude' => 14.687,
            'longitude' => 121.088,
        ])->assertCreated()->json('data.id');

        return IncidentReport::query()->findOrFail($id);
    }

    public function test_each_incident_type_routes_to_the_expected_agency(): void
    {
        $matcher = new ResponderMatcher();

        $expected = [
            [IncidentType::Fire, ResponderAgency::Bfp],
            [IncidentType::SeaIncident, ResponderAgency::Pcg],
            [IncidentType::Security, ResponderAgency::Pnp],
            [IncidentType::Medical, ResponderAgency::Ems],
            [IncidentType::RoadBlocked, ResponderAgency::Dpwh],
            [IncidentType::PowerLineDown, ResponderAgency::Utility],
            [IncidentType::Flood, ResponderAgency::Drrmo],
            [IncidentType::Landslide, ResponderAgency::Drrmo],
            [IncidentType::EarthquakeDamage, ResponderAgency::Drrmo],
            [IncidentType::Other, ResponderAgency::Drrmo],
        ];

        foreach ($expected as [$type, $agency]) {
            $this->assertSame($agency, $matcher->agencyFor($type), $type->value);
        }
    }

    public function test_a_local_team_is_preferred_over_a_national_one(): void
    {
        $matcher = new ResponderMatcher();

        ResponseTeam::query()->create(['name' => 'National BFP', 'agency' => ResponderAgency::Bfp, 'is_active' => true]);
        ResponseTeam::query()->create(['name' => 'Manila BFP', 'agency' => ResponderAgency::Bfp, 'province_code' => 'PH-MNL', 'is_active' => true]);

        $this->assertSame('Manila BFP', $matcher->teamFor(ResponderAgency::Bfp, 'PH-MNL')?->name);
        $this->assertSame('National BFP', $matcher->teamFor(ResponderAgency::Bfp, 'PH-CEB')?->name);
    }

    public function test_an_inactive_team_is_never_matched(): void
    {
        $matcher = new ResponderMatcher();

        ResponseTeam::query()->create(['name' => 'Stood down', 'agency' => ResponderAgency::Bfp, 'is_active' => false]);

        $this->assertNull($matcher->teamFor(ResponderAgency::Bfp, 'PH-MNL'));
    }

    public function test_submitting_creates_a_suggestion_that_has_not_been_sent(): void
    {
        $report = $this->report(IncidentType::Fire);

        $referral = $report->referrals()->firstOrFail();

        $this->assertSame(ReferralStatus::Suggested, $referral->status);
        $this->assertSame(ResponderAgency::Bfp, $referral->agency);
        $this->assertNull($referral->referred_at);
        $this->assertNull($referral->acknowledged_at);
    }

    public function test_advancing_stamps_its_own_timestamp_and_notifies_the_reporter(): void
    {
        $report = $this->report();
        $referral = $report->referrals()->firstOrFail();

        $this->withAuth($this->lguAdmin())
            ->putJson("/api/referrals/{$referral->id}", ['status' => ReferralStatus::Referred->value])
            ->assertOk()
            ->assertJsonPath('data.status', ReferralStatus::Referred->value);

        $referral->refresh();

        $this->assertNotNull($referral->referred_at);
        $this->assertNull($referral->acknowledged_at);

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $report->user_id,
            'type' => 'incident_referral',
        ]);
    }

    public function test_a_referral_cannot_skip_straight_to_acknowledged(): void
    {
        $report = $this->report();
        $referral = $report->referrals()->firstOrFail();

        $this->withAuth($this->lguAdmin())
            ->putJson("/api/referrals/{$referral->id}", ['status' => ReferralStatus::Acknowledged->value])
            ->assertStatus(422);

        $this->assertSame(ReferralStatus::Suggested, $referral->fresh()->status);
    }

    public function test_a_closed_referral_cannot_be_reopened(): void
    {
        $report = $this->report();
        $referral = $report->referrals()->firstOrFail();

        $admin = $this->lguAdmin();

        $this->withAuth($admin)
            ->putJson("/api/referrals/{$referral->id}", ['status' => ReferralStatus::Closed->value])
            ->assertOk();

        $this->withAuth($admin)
            ->putJson("/api/referrals/{$referral->id}", ['status' => ReferralStatus::Referred->value])
            ->assertStatus(422);
    }

    public function test_a_citizen_cannot_advance_a_referral(): void
    {
        $scenario = $this->makeFoodScenario();

        $id = $this->withAuth($scenario['citizen'])->postJson('/api/incident-reports', [
            'type' => IncidentType::Fire->value,
            'title' => 'Test incident',
            'description' => 'Something is happening.',
            'location_source' => LocationSource::Gps->value,
            'latitude' => 14.687,
            'longitude' => 121.088,
        ])->json('data.id');

        $referral = Referral::query()->where('incident_report_id', $id)->firstOrFail();

        $this->withAuth($scenario['citizen'])
            ->putJson("/api/referrals/{$referral->id}", ['status' => ReferralStatus::Referred->value])
            ->assertForbidden();

        $this->assertSame(ReferralStatus::Suggested, $referral->fresh()->status);
    }

    public function test_nothing_advances_a_referral_without_an_admin_action(): void
    {
        $report = $this->report();
        $referral = $report->referrals()->firstOrFail();

        $this->travelTo(now()->addDays(3));

        $this->assertSame(ReferralStatus::Suggested, $referral->fresh()->status);
        $this->assertNull($referral->fresh()->referred_at);
    }
}
