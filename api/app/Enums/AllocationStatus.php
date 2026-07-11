<?php

declare(strict_types=1);

namespace App\Enums;

enum AllocationStatus: string
{
    case Locked = 'locked';
    case Redeemed = 'redeemed';
    case Expired = 'expired';
    case Cancelled = 'cancelled';
}
