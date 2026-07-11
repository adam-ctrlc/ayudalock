<?php

declare(strict_types=1);

namespace App\Http\Requests\Price;

use Illuminate\Foundation\Http\FormRequest;

final class UpdatePriceRequest extends FormRequest
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
            'value' => ['required', 'numeric', 'min:0'],
            'effective_date' => ['nullable', 'date'],
            'source' => ['nullable', 'string', 'max:255'],
        ];
    }
}
