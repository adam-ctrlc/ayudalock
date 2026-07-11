<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AllocationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class Allocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'location_id',
        'commodity_id',
        'program_id',
        'quantity',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'status' => AllocationStatus::class,
            'expires_at' => 'datetime',
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

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function voucher(): HasOne
    {
        return $this->hasOne(Voucher::class);
    }

    public function redemption(): HasOne
    {
        return $this->hasOne(Redemption::class);
    }
}
