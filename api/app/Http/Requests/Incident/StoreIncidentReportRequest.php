<?php

declare(strict_types=1);

namespace App\Http\Requests\Incident;

use App\Enums\IncidentType;
use App\Enums\LocationSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreIncidentReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Severity and status are deliberately absent: a reporter describes what
     * they see, an LGU reviewer decides how bad it is.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(IncidentType::class)],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:2000'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'province_code' => ['nullable', 'string', 'exists:provinces,code'],
            'barangay_id' => ['nullable', 'integer', 'exists:barangays,id'],
            'location_source' => ['required', Rule::enum(LocationSource::class)],
            'accuracy_meters' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'photo_thumbnail' => ['nullable', 'string', 'max:200000', 'starts_with:data:image/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'photo_thumbnail.max' => 'That photo is too large. Please retake it.',
            'photo_thumbnail.starts_with' => 'The photo must be an inline image.',
        ];
    }

    public function withValidator(mixed $validator): void
    {
        $validator->after(function ($validator): void {
            if ($this->filled('province_code') || $this->filled('latitude')) {
                return;
            }

            $validator->errors()->add(
                'province_code',
                'Give a location: either a pin or a province.',
            );
        });
    }
}
