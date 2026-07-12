<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\AnnouncementComment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AnnouncementComment
 */
final class AnnouncementCommentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'body' => $this->body,
            'author' => $this->whenLoaded('author', fn () => [
                'id' => $this->author?->id,
                'name' => $this->author?->name,
                'role' => $this->author?->role?->value,
            ]),
            'replies' => AnnouncementCommentResource::collection(
                $this->whenLoaded('replies'),
            ),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
