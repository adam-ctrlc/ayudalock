<?php

declare(strict_types=1);

namespace App\Http\Requests\Announcement;

use App\Enums\AnnouncementCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreAnnouncementRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
            'category' => ['nullable', Rule::enum(AnnouncementCategory::class)],
        ];
    }
}
