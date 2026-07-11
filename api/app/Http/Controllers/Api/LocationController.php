<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class LocationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $locations = Location::query()
            ->where('is_active', true)
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')))
            ->when($request->filled('barangay_id'), fn ($query) => $query->where('barangay_id', $request->integer('barangay_id')))
            ->when($request->filled('commodity_id'), fn ($query) => $query->whereHas(
                'inventories',
                fn ($inventory) => $inventory->where('commodity_id', $request->integer('commodity_id'))
            ))
            ->with(['barangay', 'inventories.commodity'])
            ->get();

        return LocationResource::collection($locations);
    }

    public function show(Location $location): LocationResource
    {
        $location->load(['barangay', 'inventories.commodity']);

        return new LocationResource($location);
    }
}
