<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AnnouncementCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_id',
        'title',
        'body',
        'category',
    ];

    protected function casts(): array
    {
        return [
            'category' => AnnouncementCategory::class,
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(AnnouncementLike::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(AnnouncementComment::class);
    }
}
