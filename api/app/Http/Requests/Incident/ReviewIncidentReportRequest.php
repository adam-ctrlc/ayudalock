<?php

declare(strict_types=1);

namespace App\Http\Requests\Incident;

use App\Enums\ReportStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ReviewIncidentReportRequest extends FormRequest
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
            'status' => ['sometimes', Rule::enum(ReportStatus::class)],
            'severity' => ['nullable', 'integer', 'min:0', 'max:100'],
        ];
    }
}
