<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'allocation_id',
        'token',
        'qr_payload',
        'sms_code',
        'expires_at',
        'redeemed_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'redeemed_at' => 'datetime',
        ];
    }

    public function allocation(): BelongsTo
    {
        return $this->belongsTo(Allocation::class);
    }
}
