<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

final class NotificationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $items = UserNotification::query()
            ->where('user_id', $request->user()->getKey())
            ->latest()
            ->limit(50)
            ->get();

        return NotificationResource::collection($items);
    }

    public function markRead(Request $request, UserNotification $notification): JsonResponse
    {
        if ((int) $notification->user_id !== (int) $request->user()->getKey()) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        UserNotification::query()
            ->where('user_id', $request->user()->getKey())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
