<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Location
 */
final class LocationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type->value,
            'barangay_id' => $this->barangay_id,
            'barangay' => $this->whenLoaded('barangay', fn () => $this->barangay->name),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'is_active' => $this->is_active,
            'inventories' => InventoryResource::collection($this->whenLoaded('inventories')),
        ];
    }
}
