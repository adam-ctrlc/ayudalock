<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class DomainException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly int $status = Response::HTTP_UNPROCESSABLE_ENTITY,
    ) {
        parent::__construct($message);
    }
}
