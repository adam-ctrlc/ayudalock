<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Voucher\VoucherTokenService;
use Illuminate\Http\JsonResponse;

final class KeyController extends Controller
{
    public function __construct(
        private readonly VoucherTokenService $voucherToken,
    ) {}

    public function voucherPublicKey(): JsonResponse
    {
        return response()->json([
            'algorithm' => 'RSA-SHA256',
            'public_key' => $this->voucherToken->publicKeyPem(),
        ]);
    }
}
