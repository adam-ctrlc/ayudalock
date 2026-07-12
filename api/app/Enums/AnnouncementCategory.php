<?php

declare(strict_types=1);

namespace App\Enums;

enum AnnouncementCategory: string
{
    case General = 'general';
    case Relief = 'relief';
    case Advisory = 'advisory';
    case Price = 'price';
}
