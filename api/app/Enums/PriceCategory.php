<?php

declare(strict_types=1);

namespace App\Enums;

enum PriceCategory: string
{
    case Fuel = 'fuel';
    case Fare = 'fare';
    case Commodity = 'commodity';
}
