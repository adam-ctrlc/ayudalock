<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ClaimReminder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ClaimReminder
 */
final class ClaimReminderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'remind_on' => $this->remind_on?->toDateString(),
            'location' => [
                'id' => $this->location?->id,
                'name' => $this->location?->name,
                'type' => $this->location?->type?->value,
                'barangay' => $this->location?->barangay?->name,
            ],
            'commodity' => [
                'id' => $this->commodity?->id,
                'name' => $this->commodity?->name,
                'unit' => $this->commodity?->unit,
            ],
        ];
    }
}
