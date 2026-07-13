<?php

declare(strict_types=1);

namespace App\Http\Requests\Guide;

use App\Enums\GuideCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreGuideRequest extends FormRequest
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
            'category' => ['required', Rule::enum(GuideCategory::class)],
            'agency' => ['required', 'string', 'max:120'],
            'title' => ['required', 'string', 'max:200'],
            'summary' => ['required', 'string', 'max:2000'],
            'requirements' => ['required', 'array', 'min:1'],
            'requirements.*' => ['required', 'string', 'max:255'],
            'steps' => ['required', 'array', 'min:1'],
            'steps.*' => ['required', 'string', 'max:500'],
            'where_to_go' => ['required', 'string', 'max:1000'],
            'fees' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'source_url' => ['nullable', 'url', 'max:255'],
            'effective_date' => ['nullable', 'date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
