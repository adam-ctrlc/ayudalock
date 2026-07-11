<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Allocation\StoreAllocationRequest;
use App\Http\Resources\AllocationResource;
use App\Models\Allocation;
use App\Models\Commodity;
use App\Models\Location;
use App\Services\Allocation\AllocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

final class AllocationController extends Controller
{
    public function __construct(
        private readonly AllocationService $allocations,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $allocations = Allocation::query()
            ->where('user_id', $request->user()->getKey())
            ->with(['voucher', 'commodity', 'program', 'location'])
            ->latest()
            ->get();

        return AllocationResource::collection($allocations);
    }

    public function store(StoreAllocationRequest $request): JsonResponse
    {
        $location = Location::query()->findOrFail($request->integer('location_id'));
        $commodity = Commodity::query()->with('program')->findOrFail($request->integer('commodity_id'));

        $allocation = $this->allocations->createLock(
            $request->user(),
            $location,
            $commodity,
            (float) $request->input('quantity'),
        );

        return (new AllocationResource($allocation))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function destroy(Request $request, Allocation $allocation): JsonResponse
    {
        if ((int) $allocation->user_id !== (int) $request->user()->getKey()) {
            abort(Response::HTTP_FORBIDDEN, 'You can only release your own allocation.');
        }

        $this->allocations->cancel($allocation);

        return response()->json(['message' => 'Allocation released and stock returned to inventory.']);
    }
}
