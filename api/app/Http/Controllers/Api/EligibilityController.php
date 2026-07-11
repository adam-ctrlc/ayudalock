<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramResource;
use App\Services\Eligibility\EligibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EligibilityController extends Controller
{
    public function __construct(
        private readonly EligibilityService $eligibility,
    ) {}

    public function verify(Request $request): JsonResponse
    {
        $result = $this->eligibility->verify($request->user());

        return response()->json([
            'eligible' => $result['eligible'],
            'eligible_types' => $result['eligible_types'],
            'programs' => ProgramResource::collection($result['programs']),
        ]);
    }
}
