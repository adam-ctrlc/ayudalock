<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class CacheAtEdge
{
    private const STALE_MULTIPLIER = 5;

    public function handle(Request $request, Closure $next, string $seconds = '60'): Response
    {
        $response = $next($request);

        if (! $this->isCacheable($request, $response)) {
            return $response;
        }

        $maxAge = max(1, (int) $seconds);
        $stale = $maxAge * self::STALE_MULTIPLIER;

        $response->headers->set(
            'Cache-Control',
            "public, max-age=0, s-maxage={$maxAge}, stale-while-revalidate={$stale}",
        );

        return $response;
    }

    private function isCacheable(Request $request, Response $response): bool
    {
        return match (true) {
            ! $request->isMethodCacheable() => false,
            $response->getStatusCode() !== Response::HTTP_OK => false,
            $request->hasHeader('Authorization') => false,
            default => true,
        };
    }
}
