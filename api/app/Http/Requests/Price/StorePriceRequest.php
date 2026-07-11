<?php

declare(strict_types=1);

namespace App\Http\Requests\Price;

use App\Enums\PriceCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StorePriceRequest extends FormRequest
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
            'category' => ['required', Rule::enum(PriceCategory::class)],
            'name' => ['required', 'string', 'max:255'],
            'value' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:64'],
            'region' => ['nullable', 'string', 'max:64'],
            'source' => ['nullable', 'string', 'max:255'],
            'effective_date' => ['nullable', 'date'],
        ];
    }
}
