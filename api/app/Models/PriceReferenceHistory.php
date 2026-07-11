<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PriceReferenceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'price_reference_id',
        'value',
        'previous_value',
        'effective_date',
        'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'previous_value' => 'decimal:2',
            'effective_date' => 'date',
        ];
    }

    public function priceReference(): BelongsTo
    {
        return $this->belongsTo(PriceReference::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
