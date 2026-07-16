<?php

declare(strict_types=1);

namespace App\Enums;

enum InterruptionType: string
{
    case Rotating = 'rotating';
    case Scheduled = 'scheduled';
    case Emergency = 'emergency';
    case Unplanned = 'unplanned';

    public function label(): string
    {
        return match ($this) {
            self::Rotating => 'Rotating brownout',
            self::Scheduled => 'Scheduled maintenance',
            self::Emergency => 'Emergency interruption',
            self::Unplanned => 'Unplanned outage',
        };
    }

    public function isPlanned(): bool
    {
        return match ($this) {
            self::Rotating, self::Scheduled => true,
            self::Emergency, self::Unplanned => false,
        };
    }
}
