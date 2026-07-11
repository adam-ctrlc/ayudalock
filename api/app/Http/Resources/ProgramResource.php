<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Program
 */
final class ProgramResource extends JsonResource
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
            'unit' => $this->unit,
            'per_beneficiary_cap' => (float) $this->per_beneficiary_cap,
            'commodities' => CommodityResource::collection($this->whenLoaded('commodities')),
        ];
    }
}
