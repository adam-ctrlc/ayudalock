<?php

declare(strict_types=1);

namespace App\Services\Energy;

use App\Enums\GridIsland;

final class GridLocator
{
    /**
     * @var list<string>
     */
    private const MINDANAO = [
        'PH-AGN', 'PH-AGS', 'PH-BAS', 'PH-BUK', 'PH-CAM', 'PH-COM', 'PH-DAO',
        'PH-DAS', 'PH-DAV', 'PH-DIN', 'PH-LAN', 'PH-LAS', 'PH-MG', 'PH-MSC',
        'PH-MSR', 'PH-NCO', 'PH-SAR', 'PH-SCO', 'PH-SLU', 'PH-SUK', 'PH-SUN',
        'PH-SUR', 'PH-TAW', 'PH-ZAN', 'PH-ZAS', 'PH-ZSI',
    ];

    /**
     * @var list<string>
     */
    private const VISAYAS = [
        'PH-AKL', 'PH-ANT', 'PH-BIL', 'PH-BOH', 'PH-CAP', 'PH-CEB', 'PH-EAS',
        'PH-GUI', 'PH-ILI', 'PH-LEY', 'PH-NEC', 'PH-NER', 'PH-NSA', 'PH-SIG',
        'PH-SLE', 'PH-WSA',
    ];

    public function forProvince(?string $code): GridIsland
    {
        return match (true) {
            $code === null => GridIsland::Luzon,
            in_array($code, self::MINDANAO, true) => GridIsland::Mindanao,
            in_array($code, self::VISAYAS, true) => GridIsland::Visayas,
            default => GridIsland::Luzon,
        };
    }
}
