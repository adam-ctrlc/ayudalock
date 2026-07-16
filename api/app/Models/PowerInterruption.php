<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\InterruptionStatus;
use App\Enums\InterruptionType;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PowerInterruption extends Model
{
    protected $fillable = [
        'type',
        'status',
        'utility',
        'province_code',
        'barangay_id',
        'areas',
        'households_affected',
        'source',
        'external_id',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => InterruptionType::class,
            'status' => InterruptionStatus::class,
            'areas' => 'array',
            'households_affected' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_code', 'code');
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function scopeActiveAt(Builder $query, CarbonInterface $moment): Builder
    {
        return $query
            ->where('starts_at', '<=', $moment)
            ->where('ends_at', '>', $moment)
            ->whereNotIn('status', [InterruptionStatus::Cancelled, InterruptionStatus::Restored]);
    }

    public function scopeUpcoming(Builder $query, CarbonInterface $moment): Builder
    {
        return $query
            ->where('starts_at', '>', $moment)
            ->where('status', '!=', InterruptionStatus::Cancelled);
    }

    public function coversMoment(CarbonInterface $moment): bool
    {
        return $this->starts_at->lessThanOrEqualTo($moment) && $this->ends_at->greaterThan($moment);
    }
}
