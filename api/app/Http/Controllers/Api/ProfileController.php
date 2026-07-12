<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Exceptions\DomainException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

final class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $data = $request->validated();

        $user->first_name = $data['first_name'];
        $user->middle_name = $data['middle_name'] ?? null;
        $user->last_name = $data['last_name'];
        $user->phone = $data['phone'] ?? null;
        $user->email = $data['email'];

        $name = trim(implode(' ', array_filter([
            $user->first_name,
            $user->middle_name,
            $user->last_name,
        ])));
        if ($name !== '') {
            $user->name = $name;
        }

        $user->save();

        return new UserResource($user);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->string('current_password')->toString(), $user->password)) {
            throw new DomainException('Your current password is incorrect.');
        }

        $user->password = $request->string('password')->toString();
        $user->save();

        return response()->json(['message' => 'Password updated.']);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()->delete();

        return response()->json(['message' => 'Account deleted.']);
    }
}
