<?php

declare(strict_types=1);

namespace App\Enums;

enum HazardType: string
{
    case Earthquake = 'earthquake';
    case Typhoon = 'typhoon';
    case Flood = 'flood';
    case Fire = 'fire';
    case Other = 'other';
}
