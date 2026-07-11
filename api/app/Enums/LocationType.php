<?php

declare(strict_types=1);

namespace App\Enums;

enum LocationType: string
{
    case KadiwaStore = 'kadiwa_store';
    case GasStation = 'gas_station';
}
