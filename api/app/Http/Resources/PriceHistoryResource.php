<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PriceReferenceHistory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PriceReferenceHistory
 */
final class PriceHistoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'value' => (float) $this->value,
            'previous_value' => $this->previous_value !== null ? (float) $this->previous_value : null,
            'effective_date' => $this->effective_date?->toDateString(),
            'recorded_by' => $this->whenLoaded('recordedBy', fn () => $this->recordedBy?->name),
            'recorded_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
