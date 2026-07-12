<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $auth,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->auth->register($request->validated());

        return $this->respondWithToken($result, Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login($request->string('identifier')->toString(), $request->string('password')->toString());

        return $this->respondWithToken($result);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function refresh(Request $request): JsonResponse
    {
        return response()->json($this->auth->refresh($request->user()));
    }

    public function logout(): JsonResponse
    {
        return response()->json(['message' => 'Logged out. Please discard your token.']);
    }

    /**
     * @param  array{user: \App\Models\User, auth: array<string, mixed>}  $result
     */
    private function respondWithToken(array $result, int $status = Response::HTTP_OK): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($result['user']),
            ...$result['auth'],
        ], $status);
    }
}
