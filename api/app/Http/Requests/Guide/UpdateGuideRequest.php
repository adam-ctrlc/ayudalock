<?php

declare(strict_types=1);

namespace App\Http\Requests\Guide;

use App\Enums\GuideCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateGuideRequest extends FormRequest
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
            'category' => ['sometimes', Rule::enum(GuideCategory::class)],
            'agency' => ['sometimes', 'string', 'max:120'],
            'title' => ['sometimes', 'string', 'max:200'],
            'summary' => ['sometimes', 'string', 'max:2000'],
            'requirements' => ['sometimes', 'array', 'min:1'],
            'requirements.*' => ['required', 'string', 'max:255'],
            'steps' => ['sometimes', 'array', 'min:1'],
            'steps.*' => ['required', 'string', 'max:500'],
            'where_to_go' => ['sometimes', 'string', 'max:1000'],
            'fees' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'source_url' => ['nullable', 'url', 'max:255'],
            'effective_date' => ['nullable', 'date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
