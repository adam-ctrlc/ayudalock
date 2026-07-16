<?php

declare(strict_types=1);

namespace App\Enums;

enum PowerStatus: string
{
    case Online = 'online';
    case Generator = 'generator';
    case Offline = 'offline';

    public function label(): string
    {
        return match ($this) {
            self::Online => 'Powered',
            self::Generator => 'On generator',
            self::Offline => 'No power',
        };
    }

    public function canServe(): bool
    {
        return match ($this) {
            self::Online, self::Generator => true,
            self::Offline => false,
        };
    }
}
