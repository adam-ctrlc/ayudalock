<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Enums\AllocationStatus;
use App\Models\Barangay;
use Illuminate\Support\Facades\DB;

final class DashboardService
{
    /**
     * Per-barangay stock depletion for the LGU heat map.
     *
     * @return array<int, array<string, mixed>>
     */
    public function heatmap(): array
    {
        $stock = DB::table('inventories')
            ->join('locations', 'locations.id', '=', 'inventories.location_id')
            ->groupBy('locations.barangay_id')
            ->get([
                'locations.barangay_id',
                DB::raw('SUM(inventories.quantity_available) as available'),
                DB::raw('SUM(inventories.quantity_locked) as locked'),
            ])
            ->keyBy('barangay_id');

        $redeemed = DB::table('redemptions')
            ->join('locations', 'locations.id', '=', 'redemptions.location_id')
            ->groupBy('locations.barangay_id')
            ->get([
                'locations.barangay_id',
                DB::raw('SUM(redemptions.quantity) as redeemed'),
            ])
            ->keyBy('barangay_id');

        return Barangay::query()
            ->orderBy('name')
            ->get()
            ->map(function (Barangay $barangay) use ($stock, $redeemed): array {
                $id = $barangay->getKey();
                $available = (float) ($stock[$id]->available ?? 0);
                $locked = (float) ($stock[$id]->locked ?? 0);
                $consumed = (float) ($redeemed[$id]->redeemed ?? 0);
                $total = $available + $locked + $consumed;
                $depletion = $total > 0 ? round(($locked + $consumed) / $total, 4) : 0.0;

                return [
                    'barangay_id' => $id,
                    'name' => $barangay->name,
                    'city' => $barangay->city,
                    'latitude' => $barangay->latitude,
                    'longitude' => $barangay->longitude,
                    'available' => round($available, 2),
                    'locked' => round($locked, 2),
                    'redeemed' => round($consumed, 2),
                    'depletion_rate' => $depletion,
                ];
            })
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function stats(): array
    {
        $activeLocks = DB::table('allocations')
            ->where('status', AllocationStatus::Locked->value)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(quantity), 0) as quantity')
            ->first();

        $redemptionTotals = DB::table('redemptions')
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(quantity), 0) as quantity')
            ->first();

        $byLocation = DB::table('redemptions')
            ->join('locations', 'locations.id', '=', 'redemptions.location_id')
            ->groupBy('locations.id', 'locations.name')
            ->get([
                'locations.id as location_id',
                'locations.name as location_name',
                DB::raw('COUNT(*) as redemptions'),
                DB::raw('SUM(redemptions.quantity) as quantity'),
            ]);

        $byProgram = DB::table('allocations')
            ->join('programs', 'programs.id', '=', 'allocations.program_id')
            ->where('allocations.status', AllocationStatus::Redeemed->value)
            ->groupBy('programs.id', 'programs.name', 'programs.unit')
            ->get([
                'programs.id as program_id',
                'programs.name as program_name',
                'programs.unit as unit',
                DB::raw('SUM(allocations.quantity) as quantity'),
            ]);

        return [
            'active_locks' => [
                'count' => (int) $activeLocks->count,
                'quantity' => (float) $activeLocks->quantity,
            ],
            'redemptions' => [
                'count' => (int) $redemptionTotals->count,
                'quantity' => (float) $redemptionTotals->quantity,
            ],
            'redemptions_by_location' => $byLocation,
            'subsidies_by_program' => $byProgram,
        ];
    }
}
