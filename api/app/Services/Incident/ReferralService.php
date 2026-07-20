<?php

declare(strict_types=1);

namespace App\Services\Incident;

use App\Enums\ReferralStatus;
use App\Exceptions\DomainException;
use App\Models\IncidentReport;
use App\Models\Referral;
use App\Models\User;
use App\Models\UserNotification;

final class ReferralService
{
    public function __construct(
        private readonly ResponderMatcher $matcher,
    ) {}

    /**
     * Auto-match on submission. Creates a suggestion only: nothing has been
     * sent to anyone until an admin advances it.
     */
    public function suggestFor(IncidentReport $report): Referral
    {
        $agency = $this->matcher->agencyFor($report->type);
        $team = $this->matcher->teamFor($agency, $report->province_code);

        return Referral::query()->create([
            'incident_report_id' => $report->getKey(),
            'response_team_id' => $team?->getKey(),
            'agency' => $agency,
            'status' => ReferralStatus::Suggested,
        ]);
    }

    /**
     * Every transition is an explicit admin action. Nothing here advances on a
     * timer, and no arrival estimate exists to render.
     */
    public function advance(
        Referral $referral,
        ReferralStatus $status,
        User $admin,
        ?string $note = null,
    ): Referral {
        $this->assertTransitionAllowed($referral->status, $status);

        $referral->status = $status;
        $referral->created_by = $admin->getKey();

        if ($note !== null) {
            $referral->note = $note;
        }

        match ($status) {
            ReferralStatus::Referred => $referral->referred_at = now(),
            ReferralStatus::Acknowledged => $referral->acknowledged_at = now(),
            ReferralStatus::Closed => $referral->closed_at = now(),
            ReferralStatus::Suggested => null,
        };

        $referral->save();

        $this->notifyReporter($referral);

        return $referral->load('team');
    }

    private function assertTransitionAllowed(ReferralStatus $from, ReferralStatus $to): void
    {
        $allowed = match ($from) {
            ReferralStatus::Suggested => [ReferralStatus::Referred, ReferralStatus::Closed],
            ReferralStatus::Referred => [ReferralStatus::Acknowledged, ReferralStatus::Closed],
            ReferralStatus::Acknowledged => [ReferralStatus::Closed],
            ReferralStatus::Closed => [],
        };

        if (! in_array($to, $allowed, true)) {
            throw new DomainException(
                "A {$from->label()} referral cannot move to {$to->label()}.",
            );
        }
    }

    private function notifyReporter(Referral $referral): void
    {
        $report = $referral->report;

        if ($report === null) {
            return;
        }

        UserNotification::query()->create([
            'user_id' => $report->user_id,
            'type' => 'incident_referral',
            'title' => $referral->status->citizenLabel(),
            'body' => "{$report->title}: {$referral->agency->label()}.",
            'data' => ['incident_report_id' => $report->getKey()],
        ]);
    }
}
