<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Price\StorePriceRequest;
use App\Http\Requests\Price\UpdatePriceRequest;
use App\Http\Resources\PriceHistoryResource;
use App\Http\Resources\PriceReferenceResource;
use App\Models\PriceReference;
use App\Services\Price\PriceReferenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class PriceController extends Controller
{
    public function __construct(
        private readonly PriceReferenceService $prices,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $prices = PriceReference::query()
            ->when($request->filled('category'), fn ($query) => $query->where('category', $request->string('category')))
            ->when($request->filled('region'), fn ($query) => $query->where('region', $request->string('region')))
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return PriceReferenceResource::collection($prices);
    }

    public function history(PriceReference $price): AnonymousResourceCollection
    {
        $history = $price->histories()->with('recordedBy:id,name')->latest()->get();

        return PriceHistoryResource::collection($history);
    }

    public function regions(): JsonResponse
    {
        $regions = PriceReference::query()
            ->select('region')
            ->distinct()
            ->orderBy('region')
            ->pluck('region');

        return response()->json(['data' => $regions]);
    }

    public function store(StorePriceRequest $request): PriceReferenceResource
    {
        $price = $this->prices->record($request->validated(), $request->user());

        return new PriceReferenceResource($price);
    }

    public function update(UpdatePriceRequest $request, PriceReference $price): PriceReferenceResource
    {
        $updated = $this->prices->update($price, $request->validated(), $request->user());

        return new PriceReferenceResource($updated);
    }
}
