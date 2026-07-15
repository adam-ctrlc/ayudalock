<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Province;
use App\Services\Hazard\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class WeatherController extends Controller
{
    /**
     * Full current-weather set for every province (used to shade the map).
     */
    public function provinces(WeatherService $weather): JsonResponse
    {
        $weather->refreshIfStale();

        $rows = Province::query()
            ->whereNotNull('weather_updated_at')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $rows->map(fn (Province $p): array => $this->format($p))->all(),
        ]);
    }

    /**
     * Paginated, searchable, filterable, A-Z sorted weather list.
     */
    public function list(Request $request, WeatherService $weather): JsonResponse
    {
        $weather->refreshIfStale();

        $perPage = max(1, min(50, $request->integer('per_page', 8)));

        $query = Province::query()->whereNotNull('weather_updated_at');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->whereRaw('LOWER(name) LIKE ?', ['%'.strtolower($search).'%']);
        }

        $condition = trim((string) $request->query('condition', ''));
        if ($condition !== '') {
            $query->where('weather_description', $condition);
        }

        switch ($request->query('sort')) {
            case 'rain':
                $query->orderByDesc('precipitation')->orderBy('name');
                break;
            case 'temperature':
                $query->orderByDesc('temperature')->orderBy('name');
                break;
            default:
                $query->orderBy('name');
                break;
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $request->integer('page', 1));

        $conditions = Province::query()
            ->whereNotNull('weather_description')
            ->distinct()
            ->orderBy('weather_description')
            ->pluck('weather_description');

        return response()->json([
            'data' => collect($paginator->items())
                ->map(fn (Province $p): array => $this->format($p))
                ->all(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
            'conditions' => $conditions,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function format(Province $province): array
    {
        return [
            'code' => $province->code,
            'name' => $province->name,
            'temperature' => $province->temperature,
            'precipitation' => $province->precipitation ?? 0.0,
            'wind_speed' => $province->wind_speed,
            'weather_code' => $province->weather_code,
            'description' => $province->weather_description,
        ];
    }
}
