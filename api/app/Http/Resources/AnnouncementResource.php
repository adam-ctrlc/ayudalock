<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Announcement
 */
final class AnnouncementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'category' => $this->category->value,
            'likes_count' => (int) ($this->likes_count ?? 0),
            'comments_count' => (int) ($this->comments_count ?? 0),
            'liked' => (bool) ($this->liked ?? false),
            'author' => $this->whenLoaded('author', fn () => [
                'name' => $this->author?->name,
                'role' => $this->author?->role?->value,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
