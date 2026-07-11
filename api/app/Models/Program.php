<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProgramType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'unit',
        'per_beneficiary_cap',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => ProgramType::class,
            'per_beneficiary_cap' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function commodities(): HasMany
    {
        return $this->hasMany(Commodity::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(Allocation::class);
    }
}
