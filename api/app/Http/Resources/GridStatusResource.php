<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\GridStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin GridStatus
 */
final class GridStatusResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'island' => $this->island->value,
            'island_label' => $this->island->label(),
            'level' => $this->level->value,
            'level_label' => $this->level->label(),
            'is_alert' => $this->level->isAlert(),
            'demand_mw' => $this->demand_mw,
            'capacity_mw' => $this->capacity_mw,
            'reserve_mw' => $this->reserve_mw,
            'source' => $this->source,
            'note' => $this->note,
            'observed_at' => $this->observed_at?->toIso8601String(),
        ];
    }
}
