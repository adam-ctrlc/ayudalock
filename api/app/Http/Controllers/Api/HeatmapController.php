<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Hazard\HazardAggregator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class HeatmapController extends Controller
{
    public function __construct(
        private readonly HazardAggregator $aggregator,
    ) {}

    public function provinces(Request $request): JsonResponse
    {
        $window = max(1, min(365, $request->integer('window', 30)));

        return response()->json(['data' => $this->aggregator->perProvince($window)]);
    }

    public function province(Request $request, string $code): JsonResponse
    {
        $window = max(1, min(365, $request->integer('window', 90)));

        return response()->json(['data' => $this->aggregator->detail($code, $window)]);
    }
}
