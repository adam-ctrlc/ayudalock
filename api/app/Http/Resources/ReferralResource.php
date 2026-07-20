<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Referral;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Referral
 */
final class ReferralResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'agency' => $this->agency->value,
            'agency_label' => $this->agency->label(),
            'agency_short' => $this->agency->shortLabel(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'citizen_label' => $this->status->citizenLabel(),
            'note' => $this->note,
            'team' => $this->whenLoaded('team', fn () => $this->team === null ? null : [
                'id' => $this->team->id,
                'name' => $this->team->name,
                'contact_number' => $this->team->contact_number,
            ]),
            'referred_at' => $this->referred_at?->toIso8601String(),
            'acknowledged_at' => $this->acknowledged_at?->toIso8601String(),
            'closed_at' => $this->closed_at?->toIso8601String(),
        ];
    }
}
