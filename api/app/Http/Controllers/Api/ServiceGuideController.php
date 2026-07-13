<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guide\StoreGuideRequest;
use App\Http\Requests\Guide\UpdateGuideRequest;
use App\Http\Resources\ServiceGuideResource;
use App\Models\ServiceGuide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ServiceGuideController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $guides = ServiceGuide::query()
            ->where('is_active', true)
            ->when($request->filled('category'), fn ($query) => $query->where('category', $request->string('category')))
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return ServiceGuideResource::collection($guides);
    }

    public function show(ServiceGuide $guide): ServiceGuideResource
    {
        return new ServiceGuideResource($guide);
    }

    public function store(StoreGuideRequest $request): ServiceGuideResource
    {
        $guide = ServiceGuide::create($request->validated());

        return new ServiceGuideResource($guide);
    }

    public function update(UpdateGuideRequest $request, ServiceGuide $guide): ServiceGuideResource
    {
        $guide->update($request->validated());

        return new ServiceGuideResource($guide);
    }

    public function destroy(ServiceGuide $guide): JsonResponse
    {
        $guide->delete();

        return response()->json(['message' => 'Guide removed.']);
    }
}
