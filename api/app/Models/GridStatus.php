<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\GridIsland;
use App\Enums\GridLevel;
use Illuminate\Database\Eloquent\Model;

final class GridStatus extends Model
{
    protected $fillable = [
        'island',
        'level',
        'demand_mw',
        'capacity_mw',
        'reserve_mw',
        'source',
        'note',
        'observed_at',
    ];

    protected function casts(): array
    {
        return [
            'island' => GridIsland::class,
            'level' => GridLevel::class,
            'demand_mw' => 'integer',
            'capacity_mw' => 'integer',
            'reserve_mw' => 'integer',
            'observed_at' => 'datetime',
        ];
    }
}
