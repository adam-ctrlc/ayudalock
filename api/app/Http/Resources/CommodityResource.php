<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Commodity;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Commodity
 */
final class CommodityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'unit' => $this->unit,
            'program_id' => $this->program_id,
        ];
    }
}
