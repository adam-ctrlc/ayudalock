<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Services\Voucher\VoucherTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionMethod;
use Tests\TestCase;

final class VoucherKeyTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_endpoint_publishes_a_usable_jwk(): void
    {
        $this->getJson('/api/keys/voucher-public')
            ->assertOk()
            ->assertJsonStructure(['algorithm', 'public_key', 'jwk' => ['kty', 'alg', 'use', 'n', 'e']])
            ->assertJsonPath('jwk.kty', 'RSA')
            ->assertJsonPath('jwk.alg', 'RS256')
            ->assertJsonPath('jwk.e', 'AQAB');
    }

    public function test_jwk_modulus_matches_the_signing_key(): void
    {
        $service = app(VoucherTokenService::class);

        $details = openssl_pkey_get_details(openssl_pkey_get_public($service->publicKeyPem()));

        $expected = rtrim(strtr(base64_encode($details['rsa']['n']), '+/', '-_'), '=');

        $this->assertSame($expected, $service->publicKeyJwk()['n']);
    }

    public function test_signature_is_taken_over_the_encoded_payload_string(): void
    {
        $service = app(VoucherTokenService::class);

        $sign = new ReflectionMethod($service, 'sign');
        $sign->setAccessible(true);

        $token = $sign->invoke($service, ['aid' => 42, 'exp' => time() + 3600, 'sms' => '123456']);

        [$encodedPayload, $encodedSignature] = explode('.', $token);

        $signature = base64_decode(strtr($encodedSignature, '-_', '+/'), true);

        $verified = openssl_verify(
            $encodedPayload,
            $signature,
            openssl_pkey_get_public($service->publicKeyPem()),
            OPENSSL_ALGO_SHA256,
        );

        $this->assertSame(1, $verified);
        $this->assertNotNull($service->verify($token));
    }

    public function test_a_tampered_token_does_not_verify(): void
    {
        $service = app(VoucherTokenService::class);

        $sign = new ReflectionMethod($service, 'sign');
        $sign->setAccessible(true);

        $token = $sign->invoke($service, ['aid' => 42, 'exp' => time() + 3600, 'sms' => '123456']);

        [$encodedPayload, $encodedSignature] = explode('.', $token);

        $flipped = substr($encodedPayload, 0, -1).(str_ends_with($encodedPayload, 'A') ? 'B' : 'A');

        $this->assertNull($service->verify($flipped.'.'.$encodedSignature));
        $this->assertNull($service->verify('nonsense'));
    }
}
