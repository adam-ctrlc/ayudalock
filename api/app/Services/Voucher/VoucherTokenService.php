<?php

declare(strict_types=1);

namespace App\Services\Voucher;

use App\Models\Allocation;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\File;
use OpenSSLAsymmetricKey;

final class VoucherTokenService
{
    private string $keyDirectory;

    public function __construct()
    {
        $this->keyDirectory = storage_path('app/voucher-keys');
    }

    /**
     * @return array{token: string, qr_payload: string, sms_code: string}
     */
    public function issue(Allocation $allocation, CarbonInterface $expiresAt): array
    {
        $smsCode = $this->generateSmsCode();

        $payload = [
            'aid' => $allocation->getKey(),
            'exp' => $expiresAt->getTimestamp(),
            'sms' => $smsCode,
        ];

        $token = $this->sign($payload);

        $qrPayload = json_encode([
            'v' => 1,
            'type' => 'ayudalock_voucher',
            'token' => $token,
        ], JSON_THROW_ON_ERROR);

        return [
            'token' => $token,
            'qr_payload' => $qrPayload,
            'sms_code' => $smsCode,
        ];
    }

    /**
     * Verify a signed token and return its decoded payload, or null when invalid.
     *
     * @return array{aid: int, exp: int, sms: string}|null
     */
    public function verify(string $token): ?array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 2) {
            return null;
        }

        [$encodedPayload, $encodedSignature] = $parts;

        $signature = $this->base64UrlDecode($encodedSignature);
        $verified = openssl_verify($encodedPayload, $signature, $this->publicKey(), OPENSSL_ALGO_SHA256);

        if ($verified !== 1) {
            return null;
        }

        $decoded = json_decode($this->base64UrlDecode($encodedPayload), true);

        if (! is_array($decoded) || ! isset($decoded['aid'], $decoded['exp'], $decoded['sms'])) {
            return null;
        }

        return [
            'aid' => (int) $decoded['aid'],
            'exp' => (int) $decoded['exp'],
            'sms' => (string) $decoded['sms'],
        ];
    }

    public function publicKeyPem(): string
    {
        $configured = config('voucher.public_key');

        if (is_string($configured) && $configured !== '') {
            return $this->normalizePem($configured);
        }

        $this->ensureKeys();

        return File::get($this->keyDirectory.'/public.pem');
    }

    /**
     * @return array{kty: string, alg: string, use: string, n: string, e: string}
     */
    public function publicKeyJwk(): array
    {
        $details = openssl_pkey_get_details($this->publicKey());

        return [
            'kty' => 'RSA',
            'alg' => 'RS256',
            'use' => 'sig',
            'n' => $this->base64UrlEncode($details['rsa']['n']),
            'e' => $this->base64UrlEncode($details['rsa']['e']),
        ];
    }

    private function generateSmsCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function sign(array $payload): string
    {
        $encodedPayload = $this->base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));

        openssl_sign($encodedPayload, $signature, $this->privateKey(), OPENSSL_ALGO_SHA256);

        return $encodedPayload.'.'.$this->base64UrlEncode($signature);
    }

    private function privateKey(): OpenSSLAsymmetricKey
    {
        $configured = config('voucher.private_key');

        if (is_string($configured) && $configured !== '') {
            return openssl_pkey_get_private($this->normalizePem($configured));
        }

        $this->ensureKeys();

        return openssl_pkey_get_private(File::get($this->keyDirectory.'/private.pem'));
    }

    private function normalizePem(string $value): string
    {
        if (str_contains($value, 'BEGIN')) {
            return $value;
        }

        return (string) base64_decode($value, true);
    }

    private function publicKey(): OpenSSLAsymmetricKey
    {
        return openssl_pkey_get_public($this->publicKeyPem());
    }

    private function ensureKeys(): void
    {
        if (File::exists($this->keyDirectory.'/private.pem') && File::exists($this->keyDirectory.'/public.pem')) {
            return;
        }

        File::ensureDirectoryExists($this->keyDirectory);

        $resource = openssl_pkey_new([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        openssl_pkey_export($resource, $privatePem);
        $publicPem = openssl_pkey_get_details($resource)['key'];

        File::put($this->keyDirectory.'/private.pem', $privatePem);
        File::put($this->keyDirectory.'/public.pem', $publicPem);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        return (string) base64_decode(strtr($value, '-_', '+/'), true);
    }
}
