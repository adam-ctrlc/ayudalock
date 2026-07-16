<?php

declare(strict_types=1);

namespace App\Http\Requests\Energy;

use App\Enums\InterruptionStatus;
use App\Enums\InterruptionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdatePowerInterruptionRequest extends FormRequest
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
            'type' => ['sometimes', Rule::enum(InterruptionType::class)],
            'status' => ['sometimes', Rule::enum(InterruptionStatus::class)],
            'utility' => ['sometimes', 'string', 'max:120'],
            'province_code' => ['nullable', 'string', 'exists:provinces,code'],
            'barangay_id' => ['nullable', 'integer', 'exists:barangays,id'],
            'areas' => ['nullable', 'array'],
            'areas.*' => ['string', 'max:120'],
            'households_affected' => ['nullable', 'integer', 'min:0'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after:starts_at'],
        ];
    }
}
