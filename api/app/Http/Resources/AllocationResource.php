<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Allocation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Allocation
 */
final class AllocationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'quantity' => (float) $this->quantity,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'commodity' => new CommodityResource($this->whenLoaded('commodity')),
            'program' => new ProgramResource($this->whenLoaded('program')),
            'location' => new LocationResource($this->whenLoaded('location')),
            'voucher' => new VoucherResource($this->whenLoaded('voucher')),
        ];
    }
}
