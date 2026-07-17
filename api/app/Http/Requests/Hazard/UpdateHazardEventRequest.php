<?php

declare(strict_types=1);

namespace App\Http\Requests\Hazard;

use App\Enums\HazardType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateHazardEventRequest extends FormRequest
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
            'type' => ['sometimes', Rule::enum(HazardType::class)],
            'title' => ['sometimes', 'string', 'max:200'],
            'place' => ['nullable', 'string', 'max:200'],
            'province_code' => ['nullable', 'string', 'exists:provinces,code'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'magnitude' => ['nullable', 'numeric', 'min:0', 'max:12'],
            'affected_people' => ['nullable', 'integer', 'min:0'],
            'severity' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'occurred_at' => ['nullable', 'date'],
        ];
    }
}
