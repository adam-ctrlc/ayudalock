<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\InterruptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Energy\StorePowerInterruptionRequest;
use App\Http\Requests\Energy\UpdatePowerInterruptionRequest;
use App\Http\Resources\PowerInterruptionResource;
use App\Models\PowerInterruption;
use App\Services\Energy\EnergyImpactService;
use App\Services\Energy\OutageAggregator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class PowerInterruptionController extends Controller
{
    public function __construct(
        private readonly OutageAggregator $aggregator,
        private readonly EnergyImpactService $impact,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $interruptions = PowerInterruption::query()
            ->with(['province', 'barangay'])
            ->when($request->filled('province'), fn ($query) => $query->where('province_code', $request->string('province')))
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')))
            ->when($request->boolean('active'), fn ($query) => $query->activeAt(now()))
            ->when($request->boolean('upcoming'), fn ($query) => $query->upcoming(now()))
            ->orderBy('starts_at')
            ->limit(50)
            ->get();

        return PowerInterruptionResource::collection($interruptions);
    }

    public function heatmap(Request $request): JsonResponse
    {
        $hours = max(1, min(168, (int) $request->integer('hours', 24)));

        return response()->json(['data' => $this->aggregator->perProvince($hours)]);
    }

    public function store(StorePowerInterruptionRequest $request): PowerInterruptionResource
    {
        $data = $request->validated();
        $data['source'] = 'manual';
        $data['status'] ??= InterruptionStatus::Announced->value;

        $interruption = PowerInterruption::query()->create($data);

        $this->impact->syncPowerStatus();

        return new PowerInterruptionResource($interruption->load(['province', 'barangay']));
    }

    public function update(UpdatePowerInterruptionRequest $request, PowerInterruption $interruption): PowerInterruptionResource
    {
        $interruption->update($request->validated());

        $this->impact->syncPowerStatus();

        return new PowerInterruptionResource($interruption->load(['province', 'barangay']));
    }

    public function destroy(PowerInterruption $interruption): JsonResponse
    {
        $interruption->delete();

        $this->impact->syncPowerStatus();

        return response()->json(['message' => 'Power interruption removed.']);
    }
}
