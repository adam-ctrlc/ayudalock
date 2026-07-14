<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Announcement\StoreCommentRequest;
use App\Http\Resources\AnnouncementCommentResource;
use App\Models\Announcement;
use App\Models\AnnouncementComment;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

final class AnnouncementCommentController extends Controller
{
    public function index(Announcement $announcement): AnonymousResourceCollection
    {
        $comments = $announcement->comments()
            ->whereNull('parent_id')
            ->with([
                'author:id,name,role',
                'replies' => fn ($query) => $query
                    ->with('author:id,name,role')
                    ->oldest(),
            ])
            ->oldest()
            ->get();

        return AnnouncementCommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Announcement $announcement): AnnouncementCommentResource
    {
        $parentId = $request->input('parent_id');

        if ($parentId !== null) {
            $isTopLevel = $announcement->comments()
                ->whereNull('parent_id')
                ->whereKey($parentId)
                ->exists();

            if (! $isTopLevel) {
                abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'You can only reply to a top-level comment.');
            }
        }

        $comment = $announcement->comments()->create([
            'user_id' => $request->user()->getKey(),
            'parent_id' => $parentId,
            'body' => $request->string('body')->toString(),
        ]);

        if ($parentId !== null) {
            $parent = AnnouncementComment::query()->find($parentId);
            if ($parent !== null && (int) $parent->user_id !== (int) $request->user()->getKey()) {
                UserNotification::create([
                    'user_id' => $parent->user_id,
                    'type' => 'reply',
                    'title' => 'New reply',
                    'body' => ($request->user()->name ?? 'Someone').' replied to your comment.',
                    'data' => ['announcement_id' => $announcement->id],
                ]);
            }
        }

        return new AnnouncementCommentResource($comment->load('author:id,name,role'));
    }

    public function destroy(Request $request, AnnouncementComment $comment): JsonResponse
    {
        $user = $request->user();
        $isOwner = (int) $comment->user_id === (int) $user->getKey();

        if (! $isOwner && $user->role !== UserRole::LguAdmin) {
            abort(Response::HTTP_FORBIDDEN, 'You can only remove your own comment.');
        }

        $comment->delete();

        return response()->json(['message' => 'Comment removed.']);
    }
}
