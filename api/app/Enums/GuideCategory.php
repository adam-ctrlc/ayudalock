<?php

declare(strict_types=1);

namespace App\Enums;

enum GuideCategory: string
{
    case Id = 'id';
    case Benefit = 'benefit';
    case Document = 'document';
    case Relief = 'relief';
    case Tax = 'tax';
    case Work = 'work';
    case Business = 'business';
    case Travel = 'travel';
}
