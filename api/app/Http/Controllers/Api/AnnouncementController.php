<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Announcement\StoreAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

final class AnnouncementController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $userId = $request->user()->getKey();

        $announcements = Announcement::query()
            ->with('author:id,name,role')
            ->withCount([
                'likes',
                'comments',
                'likes as liked' => fn ($query) => $query->where('user_id', $userId),
            ])
            ->latest()
            ->get();

        return AnnouncementResource::collection($announcements);
    }

    public function toggleLike(Request $request, Announcement $announcement): JsonResponse
    {
        $userId = $request->user()->getKey();
        $existing = $announcement->likes()->where('user_id', $userId)->first();

        if ($existing !== null) {
            $existing->delete();
            $liked = false;
        } else {
            $announcement->likes()->create(['user_id' => $userId]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $announcement->likes()->count(),
        ]);
    }

    public function store(StoreAnnouncementRequest $request): AnnouncementResource
    {
        $announcement = Announcement::query()->create([
            'author_id' => $request->user()->getKey(),
            'title' => $request->string('title')->toString(),
            'body' => $request->string('body')->toString(),
            'category' => $request->input('category', 'general'),
        ]);

        return new AnnouncementResource($announcement->load('author:id,name,role'));
    }

    public function destroy(Request $request, Announcement $announcement): JsonResponse
    {
        $user = $request->user();
        $isOwner = (int) $announcement->author_id === (int) $user->getKey();

        if (! $isOwner && $user->role !== UserRole::LguAdmin) {
            abort(Response::HTTP_FORBIDDEN, 'You can only remove your own announcements.');
        }

        $announcement->delete();

        return response()->json(['message' => 'Announcement removed.']);
    }
}
