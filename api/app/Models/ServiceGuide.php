<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\GuideCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class ServiceGuide extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'agency',
        'title',
        'summary',
        'requirements',
        'steps',
        'where_to_go',
        'fees',
        'notes',
        'source_url',
        'effective_date',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'category' => GuideCategory::class,
            'requirements' => 'array',
            'steps' => 'array',
            'effective_date' => 'date',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
