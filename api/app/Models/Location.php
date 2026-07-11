<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\LocationType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'barangay_id',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => LocationType::class,
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_active' => 'boolean',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function merchants(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(Allocation::class);
    }
}
