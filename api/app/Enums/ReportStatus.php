<?php

declare(strict_types=1);

namespace App\Enums;

enum ReportStatus: string
{
    case Submitted = 'submitted';
    case Verified = 'verified';
    case Dismissed = 'dismissed';
    case Resolved = 'resolved';

    public function label(): string
    {
        return match ($this) {
            self::Submitted => 'Awaiting review',
            self::Verified => 'Verified',
            self::Dismissed => 'Dismissed',
            self::Resolved => 'Resolved',
        };
    }

    public function isOpen(): bool
    {
        return match ($this) {
            self::Submitted, self::Verified => true,
            self::Dismissed, self::Resolved => false,
        };
    }
}
