<?php

declare(strict_types=1);

namespace App\Enums;

enum LocationSource: string
{
    case Gps = 'gps';
    case ManualMap = 'manual_map';
    case ManualProvince = 'manual_province';

    public function label(): string
    {
        return match ($this) {
            self::Gps => 'Device GPS',
            self::ManualMap => 'Placed on map',
            self::ManualProvince => 'Province only',
        };
    }

    public function isPrecise(): bool
    {
        return match ($this) {
            self::Gps => true,
            self::ManualMap, self::ManualProvince => false,
        };
    }
}
