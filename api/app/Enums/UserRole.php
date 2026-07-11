<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Citizen = 'citizen';
    case Merchant = 'merchant';
    case LguAdmin = 'lgu_admin';
}
