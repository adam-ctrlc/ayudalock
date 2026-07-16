<?php

declare(strict_types=1);

namespace App\Enums;

enum GridLevel: string
{
    case Normal = 'normal';
    case Yellow = 'yellow';
    case Red = 'red';

    public function label(): string
    {
        return match ($this) {
            self::Normal => 'Normal',
            self::Yellow => 'Yellow Alert',
            self::Red => 'Red Alert',
        };
    }

    public function isAlert(): bool
    {
        return match ($this) {
            self::Normal => false,
            self::Yellow, self::Red => true,
        };
    }
}
