<?php

declare(strict_types=1);

namespace App\Http\Requests\Relief;

use App\Enums\LocationType;
use App\Enums\PowerStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreLocationRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::enum(LocationType::class)],
            'barangay_id' => ['required', 'integer', 'exists:barangays,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'is_active' => ['boolean'],
            'has_generator' => ['boolean'],
            'power_status' => ['nullable', Rule::enum(PowerStatus::class)],
        ];
    }
}
