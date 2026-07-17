<?php

declare(strict_types=1);

namespace App\Http\Requests\Relief;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateProgramRequest extends FormRequest
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
            'unit' => ['sometimes', 'string', 'max:20'],
            'per_beneficiary_cap' => ['sometimes', 'numeric', 'min:0.01', 'max:100000'],
            'is_active' => ['boolean'],
        ];
    }
}
