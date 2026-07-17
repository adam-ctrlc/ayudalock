<?php

declare(strict_types=1);

namespace App\Http\Requests\Relief;

use App\Enums\LocationType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateLocationRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:150'],
            'type' => ['sometimes', Rule::enum(LocationType::class)],
            'barangay_id' => ['sometimes', 'integer', 'exists:barangays,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'is_active' => ['boolean'],
            'has_generator' => ['boolean'],
        ];
    }
}
