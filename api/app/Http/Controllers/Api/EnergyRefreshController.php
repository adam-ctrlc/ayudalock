<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Allocation\AllocationService;
use App\Services\Energy\EnergyImpactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnergyRefreshController extends Controller
{
    public function __construct(
        private readonly EnergyImpactService $energyImpact,
        private readonly AllocationService $allocations,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $this->assertAuthorized($request);

        return response()->json([
            'power_status_changed' => $this->energyImpact->syncPowerStatus(),
            'allocations_released' => $this->allocations->releaseExpired(),
        ]);
    }

    private function assertAuthorized(Request $request): void
    {
        $secret = config('services.energy.refresh_secret');

        if (! is_string($secret) || $secret === '') {
            abort(Response::HTTP_FORBIDDEN, 'Energy refresh is not configured.');
        }

        $provided = $request->query('token')
            ?? $request->header('X-Refresh-Secret')
            ?? $request->bearerToken();

        if (! is_string($provided) || ! hash_equals($secret, $provided)) {
            abort(Response::HTTP_FORBIDDEN);
        }
    }
}
