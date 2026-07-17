<?php

declare(strict_types=1);

namespace App\Services\Energy;

use App\Models\PowerInterruption;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

final class OutageScheduleService
{
    /**
     * @return Collection<int, PowerInterruption>
     */
    public function activeNow(?CarbonInterface $moment = null): Collection
    {
        return PowerInterruption::query()
            ->activeAt($moment ?? now())
            ->orderBy('ends_at')
            ->get();
    }

}
