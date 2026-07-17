<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Enums\BlockedReason;
use Symfony\Component\HttpFoundation\Response;

final class BlockedClaimException extends DomainException
{
    public function __construct(
        public readonly BlockedReason $reason,
        string $message,
        int $status = Response::HTTP_UNPROCESSABLE_ENTITY,
    ) {
        parent::__construct($message, $status);
    }
}
