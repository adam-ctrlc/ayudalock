<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\GridIsland;
use App\Http\Controllers\Controller;
use App\Http\Requests\Energy\StoreGridStatusRequest;
use App\Http\Resources\GridStatusResource;
use App\Models\Province;
use App\Services\Energy\GridStatusService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class GridStatusController extends Controller
{
    public function __construct(
        private readonly GridStatusService $gridStatus,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        if ($request->filled('province')) {
            $province = Province::query()->where('code', $request->string('province'))->first();
            $island = $province?->grid ?? GridIsland::Luzon;
            $current = $this->gridStatus->current($island);

            return GridStatusResource::collection(collect([$current])->filter()->values());
        }

        return GridStatusResource::collection($this->gridStatus->currentForAllGrids());
    }

    public function store(StoreGridStatusRequest $request): GridStatusResource
    {
        $data = $request->validated();

        $status = $this->gridStatus->record(
            GridIsland::from($data['island']),
            (int) $data['capacity_mw'],
            (int) $data['demand_mw'],
            'manual',
            $data['note'] ?? null,
        );

        return new GridStatusResource($status);
    }
}
