<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Claim\StoreClaimReminderRequest;
use App\Http\Resources\ClaimReminderResource;
use App\Models\ClaimReminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ClaimReminderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $reminders = ClaimReminder::query()
            ->where('user_id', $request->user()->id)
            ->with(['location.barangay', 'commodity'])
            ->orderBy('remind_on')
            ->latest('id')
            ->get();

        return ClaimReminderResource::collection($reminders);
    }

    public function store(StoreClaimReminderRequest $request): ClaimReminderResource
    {
        $data = $request->validated();

        $reminder = ClaimReminder::create([
            'user_id' => $request->user()->id,
            'location_id' => $data['location_id'],
            'commodity_id' => $data['commodity_id'],
            'quantity' => $data['quantity'],
            'remind_on' => $data['remind_on'] ?? now()->toDateString(),
        ]);

        $reminder->load(['location.barangay', 'commodity']);

        return new ClaimReminderResource($reminder);
    }

    public function destroy(Request $request, ClaimReminder $reminder): JsonResponse
    {
        abort_unless($reminder->user_id === $request->user()->id, 403);

        $reminder->delete();

        return response()->json(['message' => 'Reminder removed.']);
    }
}
