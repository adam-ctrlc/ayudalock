<?php

declare(strict_types=1);

namespace App\Enums;

enum InterruptionStatus: string
{
    case Announced = 'announced';
    case Active = 'active';
    case Restored = 'restored';
    case Cancelled = 'cancelled';
}
