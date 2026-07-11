<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Redemption;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Redemption
 */
final class RedemptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'allocation_id' => $this->allocation_id,
            'location_id' => $this->location_id,
            'merchant_id' => $this->merchant_id,
            'quantity' => (float) $this->quantity,
            'source' => $this->source->value,
            'client_uuid' => $this->client_uuid,
            'redeemed_at' => $this->redeemed_at?->toIso8601String(),
            'synced_at' => $this->synced_at?->toIso8601String(),
        ];
    }
}
