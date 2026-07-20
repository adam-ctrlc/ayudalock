<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReferralStatus;
use App\Enums\ResponderAgency;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Referral extends Model
{
    protected $fillable = [
        'incident_report_id',
        'response_team_id',
        'agency',
        'status',
        'note',
        'created_by',
        'referred_at',
        'acknowledged_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'agency' => ResponderAgency::class,
            'status' => ReferralStatus::class,
            'referred_at' => 'datetime',
            'acknowledged_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(IncidentReport::class, 'incident_report_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(ResponseTeam::class, 'response_team_id');
    }
}
