<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Exceptions\DomainException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

final class AuthService
{
    public function __construct(
        private readonly JwtService $jwt,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array{user: User, auth: array<string, mixed>}
     */
    public function register(array $data): array
    {
        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'],
            'phil_sys_id' => $data['phil_sys_id'] ?? null,
            'phone' => $data['phone'] ?? null,
            'barangay_id' => $data['barangay_id'] ?? null,
            'location_id' => $data['location_id'] ?? null,
        ]);

        return [
            'user' => $user,
            'auth' => $this->jwt->issue($user),
        ];
    }

    /**
     * @return array{user: User, auth: array<string, mixed>}
     */
    public function login(string $email, string $password): array
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null || ! Hash::check($password, $user->password)) {
            throw new DomainException('These credentials do not match our records.', Response::HTTP_UNAUTHORIZED);
        }

        return [
            'user' => $user,
            'auth' => $this->jwt->issue($user),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function refresh(User $user): array
    {
        return $this->jwt->issue($user);
    }
}
