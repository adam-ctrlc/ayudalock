<?php

declare(strict_types=1);

namespace App\Enums;

enum GridIsland: string
{
    case Luzon = 'luzon';
    case Visayas = 'visayas';
    case Mindanao = 'mindanao';

    public function label(): string
    {
        return match ($this) {
            self::Luzon => 'Luzon Grid',
            self::Visayas => 'Visayas Grid',
            self::Mindanao => 'Mindanao Grid',
        };
    }
}
