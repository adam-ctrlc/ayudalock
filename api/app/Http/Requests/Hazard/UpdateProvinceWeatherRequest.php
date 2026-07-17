<?php

declare(strict_types=1);

namespace App\Http\Requests\Hazard;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateProvinceWeatherRequest extends FormRequest
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
            'precipitation' => ['required', 'numeric', 'min:0', 'max:2000'],
            'temperature' => ['nullable', 'numeric', 'between:-20,60'],
            'wind_speed' => ['nullable', 'numeric', 'min:0', 'max:400'],
            'weather_description' => ['nullable', 'string', 'max:120'],
            'weather_note' => ['required', 'string', 'max:200'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'weather_note.required' => 'Say where this reading came from. Manual weather overrides are published with their source.',
        ];
    }
}
