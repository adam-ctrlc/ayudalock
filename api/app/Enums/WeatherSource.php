<?php

declare(strict_types=1);

namespace App\Enums;

enum WeatherSource: string
{
    case OpenMeteo = 'open-meteo';
    case Manual = 'manual';

    public function label(): string
    {
        return match ($this) {
            self::OpenMeteo => 'Live observation (Open-Meteo)',
            self::Manual => 'Manually set by LGU',
        };
    }

    public function isLive(): bool
    {
        return match ($this) {
            self::OpenMeteo => true,
            self::Manual => false,
        };
    }
}
