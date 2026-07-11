<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PriceReference;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PriceReference
 */
final class PriceReferenceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $value = (float) $this->value;
        $previous = $this->previous_value !== null ? (float) $this->previous_value : null;

        return [
            'id' => $this->id,
            'category' => $this->category->value,
            'name' => $this->name,
            'value' => $value,
            'unit' => $this->unit,
            'region' => $this->region,
            'source' => $this->source,
            'effective_date' => $this->effective_date?->toDateString(),
            'previous_value' => $previous,
            'trend' => $this->trend($value, $previous),
            'change' => $previous !== null ? round($value - $previous, 2) : null,
            'change_percent' => $previous !== null && $previous > 0
                ? round((($value - $previous) / $previous) * 100, 2)
                : null,
        ];
    }

    private function trend(float $value, ?float $previous): string
    {
        if ($previous === null) {
            return 'steady';
        }

        return match (true) {
            $value > $previous => 'up',
            $value < $previous => 'down',
            default => 'steady',
        };
    }
}
