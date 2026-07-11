<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Allocation\AllocationService;
use Illuminate\Console\Command;

final class ReleaseExpiredAllocations extends Command
{
    protected $signature = 'allocations:release-expired';

    protected $description = 'Release locked allocations that have expired and return their stock to inventory.';

    public function handle(AllocationService $allocations): int
    {
        $released = $allocations->releaseExpired();

        $this->info("Released {$released} expired allocation(s).");

        return self::SUCCESS;
    }
}
