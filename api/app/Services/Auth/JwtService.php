<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Carbon;
use Throwable;

final class JwtService
{
    private string $secret;

    private string $algo;

    private int $ttlMinutes;

    private string $issuer;

    public function __construct()
    {
        $this->secret = (string) config('jwt.secret');
        $this->algo = (string) config('jwt.algo', 'HS256');
        $this->ttlMinutes = (int) config('jwt.ttl', 1440);
        $this->issuer = (string) config('jwt.issuer', 'ayudalock');
    }

    /**
     * @return array{token: string, token_type: string, expires_in: int, expires_at: string}
     */
    public function issue(User $user): array
    {
        $issuedAt = Carbon::now();
        $expiresAt = $issuedAt->copy()->addMinutes($this->ttlMinutes);

        $payload = [
            'iss' => $this->issuer,
            'sub' => $user->getKey(),
            'role' => $user->role->value,
            'iat' => $issuedAt->getTimestamp(),
            'exp' => $expiresAt->getTimestamp(),
        ];

        return [
            'token' => JWT::encode($payload, $this->secret, $this->algo),
            'token_type' => 'bearer',
            'expires_in' => $this->ttlMinutes * 60,
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    public function subjectFrom(string $token): ?int
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, $this->algo));
        } catch (Throwable) {
            return null;
        }

        return isset($decoded->sub) ? (int) $decoded->sub : null;
    }
}
