<?php

declare(strict_types=1);

namespace App\Enums;

enum IncidentType: string
{
    case Flood = 'flood';
    case Fire = 'fire';
    case Landslide = 'landslide';
    case EarthquakeDamage = 'earthquake_damage';
    case RoadBlocked = 'road_blocked';
    case PowerLineDown = 'power_line_down';
    case Medical = 'medical';
    case SeaIncident = 'sea_incident';
    case Security = 'security';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Flood => 'Flooding',
            self::Fire => 'Fire',
            self::Landslide => 'Landslide',
            self::EarthquakeDamage => 'Earthquake damage',
            self::RoadBlocked => 'Road blocked',
            self::PowerLineDown => 'Downed power line',
            self::Medical => 'Medical emergency',
            self::SeaIncident => 'Sea incident',
            self::Security => 'Security incident',
            self::Other => 'Other',
        };
    }

    public function hazardType(): ?HazardType
    {
        return match ($this) {
            self::Flood => HazardType::Flood,
            self::Fire => HazardType::Fire,
            self::EarthquakeDamage => HazardType::Earthquake,
            self::Landslide, self::RoadBlocked, self::PowerLineDown,
            self::Medical, self::SeaIncident, self::Security, self::Other => HazardType::Other,
        };
    }
}
