<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PowerInterruption;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PowerInterruption
 */
final class PowerInterruptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'is_planned' => $this->type->isPlanned(),
            'status' => $this->status->value,
            'utility' => $this->utility,
            'province_code' => $this->province_code,
            'province' => $this->whenLoaded('province', fn () => $this->province?->name),
            'barangay_id' => $this->barangay_id,
            'barangay' => $this->whenLoaded('barangay', fn () => $this->barangay?->name),
            'areas' => $this->areas ?? [],
            'households_affected' => $this->households_affected,
            'source' => $this->source,
            'starts_at' => $this->starts_at->toIso8601String(),
            'ends_at' => $this->ends_at->toIso8601String(),
            'is_active_now' => $this->coversMoment(now()),
        ];
    }
}
