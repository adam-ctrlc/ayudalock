<?php

declare(strict_types=1);

namespace App\Http\Requests\Energy;

use App\Enums\GridIsland;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreGridStatusRequest extends FormRequest
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
            'island' => ['required', Rule::enum(GridIsland::class)],
            'capacity_mw' => ['required', 'integer', 'min:0'],
            'demand_mw' => ['required', 'integer', 'min:0'],
            'note' => ['nullable', 'string', 'max:200'],
        ];
    }
}
