<?php

declare(strict_types=1);

return [
    'ttl_minutes' => (int) env('VOUCHER_TTL_MINUTES', 120),

    // On serverless (Vercel), the filesystem is read-only and /tmp is ephemeral, so
    // the RSA voucher keypair must come from env. Values may be raw PEM or base64-encoded
    // PEM (single-line, env-friendly). When unset, keys are generated under storage/ for
    // local development. Produce env values with: php artisan voucher:keys
    'private_key' => env('VOUCHER_PRIVATE_KEY'),
    'public_key' => env('VOUCHER_PUBLIC_KEY'),
];
