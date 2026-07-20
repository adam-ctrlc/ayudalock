<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ResponderAgency;
use Illuminate\Database\Eloquent\Model;

final class ResponseTeam extends Model
{
    protected $fillable = [
        'name',
        'agency',
        'contact_number',
        'province_code',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'agency' => ResponderAgency::class,
            'is_active' => 'boolean',
        ];
    }
}
