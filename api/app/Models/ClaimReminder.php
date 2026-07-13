<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ClaimReminder extends Model
{
    protected $fillable = [
        'user_id',
        'location_id',
        'commodity_id',
        'quantity',
        'remind_on',
    ];

    protected function casts(): array
    {
        return [
            'remind_on' => 'date',
            'quantity' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function commodity(): BelongsTo
    {
        return $this->belongsTo(Commodity::class);
    }
}
