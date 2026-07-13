<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\GuideCategory;
use App\Models\ServiceGuide;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceGuide>
 */
final class ServiceGuideFactory extends Factory
{
    protected $model = ServiceGuide::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category' => fake()->randomElement(GuideCategory::cases())->value,
            'agency' => fake()->randomElement(['SSS', 'PhilSys', 'PhilHealth', 'Pag-IBIG', 'PSA', 'LGU']),
            'title' => fake()->sentence(4),
            'summary' => fake()->sentence(12),
            'requirements' => [fake()->sentence(3), fake()->sentence(3)],
            'steps' => [fake()->sentence(5), fake()->sentence(5)],
            'where_to_go' => fake()->sentence(6),
            'fees' => fake()->randomElement(['Free', 'PHP 100', null]),
            'notes' => fake()->boolean() ? fake()->sentence(8) : null,
            'source_url' => fake()->boolean() ? fake()->url() : null,
            'effective_date' => now()->toDateString(),
            'sort_order' => fake()->numberBetween(0, 100),
            'is_active' => true,
        ];
    }
}
