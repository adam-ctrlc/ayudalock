<?php

declare(strict_types=1);

return [
    'secret' => env('JWT_SECRET', env('APP_KEY')),
    'ttl' => (int) env('JWT_TTL', 1440),
    'issuer' => env('JWT_ISSUER', 'ayudalock'),
    'algo' => 'HS256',
];
