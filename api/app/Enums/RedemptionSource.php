<?php

declare(strict_types=1);

namespace App\Enums;

enum RedemptionSource: string
{
    case Online = 'online';
    case Offline = 'offline';
}
