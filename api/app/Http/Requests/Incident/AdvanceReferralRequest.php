<?php

declare(strict_types=1);

namespace App\Http\Requests\Incident;

use App\Enums\ReferralStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class AdvanceReferralRequest extends FormRequest
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
            'status' => ['required', Rule::enum(ReferralStatus::class)],
            'note' => ['nullable', 'string', 'max:200'],
        ];
    }
}
