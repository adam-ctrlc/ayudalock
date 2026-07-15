<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\HazardType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class HazardEvent extends Model
{
    protected $fillable = [
        'type',
        'source',
        'external_id',
        'title',
        'place',
        'magnitude',
        'latitude',
        'longitude',
        'province_code',
        'affected_people',
        'severity',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => HazardType::class,
            'magnitude' => 'decimal:2',
            'latitude' => 'float',
            'longitude' => 'float',
            'affected_people' => 'integer',
            'severity' => 'integer',
            'occurred_at' => 'datetime',
        ];
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_code', 'code');
    }
}
