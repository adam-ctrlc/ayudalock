<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\JsonResponse;

final class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboard,
    ) {}

    public function heatmap(): JsonResponse
    {
        return response()->json(['data' => $this->dashboard->heatmap()]);
    }

    public function stats(): JsonResponse
    {
        return response()->json($this->dashboard->stats());
    }
}
