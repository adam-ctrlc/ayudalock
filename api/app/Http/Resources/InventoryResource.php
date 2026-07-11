<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Inventory
 */
final class InventoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'commodity_id' => $this->commodity_id,
            'commodity' => new CommodityResource($this->whenLoaded('commodity')),
            'quantity_available' => (float) $this->quantity_available,
            'quantity_locked' => (float) $this->quantity_locked,
        ];
    }
}
