<?php

declare(strict_types=1);

namespace App\Http\Requests\Claim;

use Illuminate\Foundation\Http\FormRequest;

final class StoreClaimReminderRequest extends FormRequest
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
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'commodity_id' => ['required', 'integer', 'exists:commodities,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'remind_on' => ['nullable', 'date'],
        ];
    }
}
