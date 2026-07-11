<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Voucher
 */
final class VoucherResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'token' => $this->token,
            'qr_payload' => $this->qr_payload,
            'sms_code' => $this->sms_code,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'redeemed_at' => $this->redeemed_at?->toIso8601String(),
        ];
    }
}
