<?php

declare(strict_types=1);

namespace App\Enums;

enum ReferralStatus: string
{
    case Suggested = 'suggested';
    case Referred = 'referred';
    case Acknowledged = 'acknowledged';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Suggested => 'Suggested',
            self::Referred => 'Referred',
            self::Acknowledged => 'Acknowledged',
            self::Closed => 'Closed',
        };
    }

    /**
     * What the reporter is told. Deliberately describes the coordination step
     * that actually happened, never an agency movement this system cannot see.
     */
    public function citizenLabel(): string
    {
        return match ($this) {
            self::Suggested => 'Matched to an agency, not yet sent',
            self::Referred => 'Sent to the agency',
            self::Acknowledged => 'Agency confirmed receipt',
            self::Closed => 'Closed by the LGU',
        };
    }
}
