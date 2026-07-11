<?php

declare(strict_types=1);

namespace App\Http\Requests\Redemption;

use Illuminate\Foundation\Http\FormRequest;

final class StoreRedemptionRequest extends FormRequest
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
            'token' => ['required_without:sms_code', 'nullable', 'string'],
            'sms_code' => ['required_without:token', 'nullable', 'string'],
            'client_uuid' => ['nullable', 'uuid'],
        ];
    }

    public function credential(): string
    {
        return (string) ($this->input('token') ?? $this->input('sms_code'));
    }
}
