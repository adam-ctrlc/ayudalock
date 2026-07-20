<?php

declare(strict_types=1);

namespace App\Services\Incident;

use App\Enums\IncidentType;
use App\Enums\ResponderAgency;
use App\Models\ResponseTeam;

final class ResponderMatcher
{
    public function agencyFor(IncidentType $type): ResponderAgency
    {
        return match ($type) {
            IncidentType::Fire => ResponderAgency::Bfp,
            IncidentType::SeaIncident => ResponderAgency::Pcg,
            IncidentType::Security => ResponderAgency::Pnp,
            IncidentType::Medical => ResponderAgency::Ems,
            IncidentType::RoadBlocked => ResponderAgency::Dpwh,
            IncidentType::PowerLineDown => ResponderAgency::Utility,
            IncidentType::Flood,
            IncidentType::Landslide,
            IncidentType::EarthquakeDamage,
            IncidentType::Other => ResponderAgency::Drrmo,
        };
    }

    public function teamFor(ResponderAgency $agency, ?string $provinceCode): ?ResponseTeam
    {
        $teams = ResponseTeam::query()
            ->where('is_active', true)
            ->where('agency', $agency)
            ->orderBy('id')
            ->get();

        $local = $teams->first(
            fn (ResponseTeam $team): bool => $provinceCode !== null
                && $team->province_code === $provinceCode,
        );

        return $local ?? $teams->first();
    }
}
