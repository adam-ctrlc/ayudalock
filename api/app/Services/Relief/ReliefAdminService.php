<?php

declare(strict_types=1);

namespace App\Services\Relief;

use App\Enums\AllocationStatus;
use App\Exceptions\DomainException;
use App\Models\Allocation;
use App\Models\Inventory;
use App\Models\Location;
use Illuminate\Support\Facades\DB;

final class ReliefAdminService
{
    public function restock(Location $location, int $commodityId, float $quantityAvailable): Inventory
    {
        if ($quantityAvailable < 0) {
            throw new DomainException('Stock cannot be negative.');
        }

        return DB::transaction(function () use ($location, $commodityId, $quantityAvailable): Inventory {
            $inventory = Inventory::query()
                ->where('location_id', $location->getKey())
                ->where('commodity_id', $commodityId)
                ->lockForUpdate()
                ->first();

            if ($inventory === null) {
                return Inventory::query()->create([
                    'location_id' => $location->getKey(),
                    'commodity_id' => $commodityId,
                    'quantity_available' => $quantityAvailable,
                    'quantity_locked' => 0,
                ]);
            }

            $inventory->quantity_available = $quantityAvailable;
            $inventory->save();

            return $inventory;
        });
    }

    public function deleteLocation(Location $location): void
    {
        $locked = Allocation::query()
            ->where('location_id', $location->getKey())
            ->where('status', AllocationStatus::Locked)
            ->count();

        if ($locked > 0) {
            throw new DomainException(
                "This service point has {$locked} voucher(s) still locked against it. Release or let them expire before removing it.",
            );
        }

        $location->delete();
    }
}
