<?php

declare(strict_types=1);

namespace App\Http\Requests\Allocation;

use Illuminate\Foundation\Http\FormRequest;

final class StoreAllocationRequest extends FormRequest
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
            'quantity' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
