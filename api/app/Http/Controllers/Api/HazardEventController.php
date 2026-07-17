<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hazard\StoreHazardEventRequest;
use App\Http\Requests\Hazard\UpdateHazardEventRequest;
use App\Http\Resources\HazardEventResource;
use App\Models\HazardEvent;
use App\Services\Hazard\ProvinceLocator;
use App\Services\Hazard\UsgsEarthquakeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

final class HazardEventController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $events = HazardEvent::query()
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')))
            ->when($request->filled('province'), fn ($query) => $query->where('province_code', $request->string('province')))
            ->orderByDesc('occurred_at')
            ->limit(50)
            ->get();

        return HazardEventResource::collection($events);
    }

    public function store(StoreHazardEventRequest $request, ProvinceLocator $locator): HazardEventResource
    {
        $data = $request->validated();
        $data['source'] = 'manual';

        if (empty($data['province_code']) && isset($data['latitude'], $data['longitude'])) {
            $data['province_code'] = $locator->nearest((float) $data['latitude'], (float) $data['longitude']);
        }

        $data['occurred_at'] ??= now();

        return new HazardEventResource(HazardEvent::create($data));
    }

    public function update(UpdateHazardEventRequest $request, HazardEvent $hazard, ProvinceLocator $locator): HazardEventResource
    {
        $data = $request->validated();

        if (empty($data['province_code']) && isset($data['latitude'], $data['longitude'])) {
            $data['province_code'] = $locator->nearest((float) $data['latitude'], (float) $data['longitude']);
        }

        $hazard->update($data);

        return new HazardEventResource($hazard);
    }

    public function destroy(HazardEvent $hazard): JsonResponse
    {
        $hazard->delete();

        return response()->json(['message' => 'Hazard event removed.']);
    }

    public function refresh(Request $request, UsgsEarthquakeService $usgs): JsonResponse
    {
        $secret = config('services.hazard.refresh_secret');
        $provided = $request->query('token') ?? $request->header('X-Refresh-Secret');

        if ($secret !== null && $provided !== $secret) {
            abort(Response::HTTP_FORBIDDEN);
        }

        return response()->json(['imported' => $usgs->refresh()]);
    }
}
