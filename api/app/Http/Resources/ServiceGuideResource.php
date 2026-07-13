<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ServiceGuide;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ServiceGuide
 */
final class ServiceGuideResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category->value,
            'agency' => $this->agency,
            'title' => $this->title,
            'summary' => $this->summary,
            'requirements' => $this->requirements ?? [],
            'steps' => $this->steps ?? [],
            'where_to_go' => $this->where_to_go,
            'fees' => $this->fees,
            'notes' => $this->notes,
            'source_url' => $this->source_url,
            'effective_date' => $this->effective_date?->toDateString(),
            'updated_at' => $this->updated_at?->toDateString(),
        ];
    }
}
