<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class Province extends Model
{
    protected $fillable = [
        'code',
        'name',
        'region',
        'latitude',
        'longitude',
        'population',
        'temperature',
        'precipitation',
        'weather_code',
        'weather_description',
        'wind_speed',
        'weather_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'population' => 'integer',
            'temperature' => 'float',
            'precipitation' => 'float',
            'weather_code' => 'integer',
            'wind_speed' => 'float',
            'weather_updated_at' => 'datetime',
        ];
    }
}
