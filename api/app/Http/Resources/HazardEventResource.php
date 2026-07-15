<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\HazardType;
use App\Models\HazardEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin HazardEvent
 */
final class HazardEventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type instanceof HazardType ? $this->type->value : $this->type,
            'source' => $this->source,
            'title' => $this->title,
            'place' => $this->place,
            'magnitude' => $this->magnitude !== null ? (float) $this->magnitude : null,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'province_code' => $this->province_code,
            'affected_people' => $this->affected_people !== null ? (int) $this->affected_people : null,
            'severity' => (int) $this->severity,
            'occurred_at' => $this->occurred_at?->toIso8601String(),
        ];
    }
}
