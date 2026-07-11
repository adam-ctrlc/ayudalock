<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PriceCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class PriceReference extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'name',
        'value',
        'unit',
        'region',
        'source',
        'effective_date',
        'previous_value',
    ];

    protected function casts(): array
    {
        return [
            'category' => PriceCategory::class,
            'value' => 'decimal:2',
            'previous_value' => 'decimal:2',
            'effective_date' => 'date',
        ];
    }

    public function histories(): HasMany
    {
        return $this->hasMany(PriceReferenceHistory::class);
    }
}
