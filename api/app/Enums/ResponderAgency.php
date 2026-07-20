<?php

declare(strict_types=1);

namespace App\Enums;

enum ResponderAgency: string
{
    case Bfp = 'bfp';
    case Pcg = 'pcg';
    case Pnp = 'pnp';
    case Drrmo = 'drrmo';
    case Ems = 'ems';
    case Dpwh = 'dpwh';
    case Utility = 'utility';
    case Navy = 'navy';

    public function label(): string
    {
        return match ($this) {
            self::Bfp => 'Bureau of Fire Protection',
            self::Pcg => 'Philippine Coast Guard',
            self::Pnp => 'Philippine National Police',
            self::Drrmo => 'LGU Disaster Risk Reduction Office',
            self::Ems => 'Emergency Medical Services',
            self::Dpwh => 'Department of Public Works and Highways',
            self::Utility => 'Distribution utility',
            self::Navy => 'Philippine Navy',
        };
    }

    public function shortLabel(): string
    {
        return match ($this) {
            self::Bfp => 'BFP',
            self::Pcg => 'Coast Guard',
            self::Pnp => 'PNP',
            self::Drrmo => 'DRRMO',
            self::Ems => 'EMS',
            self::Dpwh => 'DPWH',
            self::Utility => 'Utility',
            self::Navy => 'Navy',
        };
    }
}
