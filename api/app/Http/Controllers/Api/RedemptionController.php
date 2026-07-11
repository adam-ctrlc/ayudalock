<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Redemption\BatchRedemptionRequest;
use App\Http\Requests\Redemption\StoreRedemptionRequest;
use App\Http\Resources\RedemptionResource;
use App\Services\Redemption\OfflineSyncService;
use App\Services\Redemption\RedemptionService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

final class RedemptionController extends Controller
{
    public function __construct(
        private readonly RedemptionService $redemptions,
        private readonly OfflineSyncService $offlineSync,
    ) {}

    public function store(StoreRedemptionRequest $request): JsonResponse
    {
        $redemption = $this->redemptions->redeem(
            $request->user(),
            $request->credential(),
            clientUuid: $request->input('client_uuid'),
        );

        return (new RedemptionResource($redemption))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function batch(BatchRedemptionRequest $request): JsonResponse
    {
        $results = $this->offlineSync->processBatch($request->user(), $request->normalizedItems());

        return response()->json(['results' => $results]);
    }
}
