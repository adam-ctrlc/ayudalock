<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class FranchiseHolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'license_number',
        'plate_number',
        'phil_sys_id',
        'driver_name',
        'franchise_type',
        'barangay',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
