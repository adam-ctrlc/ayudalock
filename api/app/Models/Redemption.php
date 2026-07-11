<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\RedemptionSource;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Redemption extends Model
{
    use HasFactory;

    protected $fillable = [
        'allocation_id',
        'merchant_id',
        'location_id',
        'quantity',
        'source',
        'client_uuid',
        'redeemed_at',
        'synced_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'source' => RedemptionSource::class,
            'redeemed_at' => 'datetime',
            'synced_at' => 'datetime',
        ];
    }

    public function allocation(): BelongsTo
    {
        return $this->belongsTo(Allocation::class);
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
