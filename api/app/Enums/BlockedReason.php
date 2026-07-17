<?php

declare(strict_types=1);

namespace App\Enums;

enum BlockedReason: string
{
    case NotEligible = 'not_eligible';
    case OverCap = 'over_cap';
    case ProgramInactive = 'program_inactive';
    case LocationOffline = 'location_offline';
    case InsufficientStock = 'insufficient_stock';

    public function label(): string
    {
        return match ($this) {
            self::NotEligible => 'Not on the registry',
            self::OverCap => 'Over program cap',
            self::ProgramInactive => 'Program inactive',
            self::LocationOffline => 'Service point had no power',
            self::InsufficientStock => 'Out of stock',
        };
    }

    public function isLeakagePrevented(): bool
    {
        return match ($this) {
            self::NotEligible, self::OverCap => true,
            self::ProgramInactive, self::LocationOffline, self::InsufficientStock => false,
        };
    }
}
