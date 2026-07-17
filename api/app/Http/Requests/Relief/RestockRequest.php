<?php

declare(strict_types=1);

namespace App\Http\Requests\Relief;

use Illuminate\Foundation\Http\FormRequest;

final class RestockRequest extends FormRequest
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
            'commodity_id' => ['required', 'integer', 'exists:commodities,id'],
            'quantity_available' => ['required', 'numeric', 'min:0', 'max:1000000'],
        ];
    }
}
