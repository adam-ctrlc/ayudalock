<?php

declare(strict_types=1);

namespace App\Http\Requests\Redemption;

use Illuminate\Foundation\Http\FormRequest;

final class BatchRedemptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.client_uuid' => ['required', 'uuid', 'distinct'],
            'items.*.token' => ['required_without:items.*.sms_code', 'nullable', 'string'],
            'items.*.sms_code' => ['required_without:items.*.token', 'nullable', 'string'],
            'items.*.redeemed_at' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<int, array{client_uuid: string, credential: string, redeemed_at: string|null}>
     */
    public function normalizedItems(): array
    {
        return array_map(static function (array $item): array {
            return [
                'client_uuid' => $item['client_uuid'],
                'credential' => (string) ($item['token'] ?? $item['sms_code'] ?? ''),
                'redeemed_at' => $item['redeemed_at'] ?? null,
            ];
        }, $this->input('items', []));
    }
}
