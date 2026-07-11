<?php

declare(strict_types=1);

namespace App\Services\Redemption;

use App\Enums\AllocationStatus;
use App\Enums\RedemptionSource;
use App\Exceptions\DomainException;
use App\Models\Allocation;
use App\Models\Inventory;
use App\Models\Redemption;
use App\Models\User;
use App\Models\Voucher;
use App\Services\Voucher\VoucherTokenService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

final class RedemptionService
{
    public function __construct(
        private readonly VoucherTokenService $voucherToken,
    ) {}

    public function redeem(
        User $merchant,
        string $credential,
        RedemptionSource $source = RedemptionSource::Online,
        ?string $clientUuid = null,
        ?Carbon $redeemedAt = null,
    ): Redemption {
        $redeemedAt ??= Carbon::now();

        if ($clientUuid !== null) {
            $existing = Redemption::query()->where('client_uuid', $clientUuid)->first();

            if ($existing !== null) {
                return $existing->load('allocation');
            }
        }

        $voucher = $this->resolveVoucher($credential);

        if ($voucher === null) {
            throw new DomainException('Voucher not found.', Response::HTTP_NOT_FOUND);
        }

        $allocation = $voucher->allocation;

        if ((int) $merchant->location_id !== (int) $allocation->location_id) {
            throw new DomainException('This voucher can only be redeemed at its assigned location.', Response::HTTP_FORBIDDEN);
        }

        switch ($allocation->status) {
            case AllocationStatus::Redeemed:
                throw new DomainException('This voucher has already been redeemed.', Response::HTTP_CONFLICT);
            case AllocationStatus::Cancelled:
                throw new DomainException('This voucher was cancelled.');
            case AllocationStatus::Expired:
                throw new DomainException('This voucher has expired.');
            case AllocationStatus::Locked:
                break;
        }

        if ($voucher->expires_at->isBefore($redeemedAt)) {
            $this->expire($allocation);

            throw new DomainException('This voucher has expired.');
        }

        return DB::transaction(function () use ($merchant, $allocation, $voucher, $source, $clientUuid, $redeemedAt): Redemption {
            $inventory = Inventory::query()
                ->where('location_id', $allocation->location_id)
                ->where('commodity_id', $allocation->commodity_id)
                ->lockForUpdate()
                ->first();

            if ($inventory !== null) {
                $inventory->quantity_locked = max(0.0, (float) $inventory->quantity_locked - (float) $allocation->quantity);
                $inventory->save();
            }

            $allocation->status = AllocationStatus::Redeemed;
            $allocation->save();

            $voucher->redeemed_at = $redeemedAt;
            $voucher->save();

            return Redemption::query()->create([
                'allocation_id' => $allocation->getKey(),
                'merchant_id' => $merchant->getKey(),
                'location_id' => $allocation->location_id,
                'quantity' => $allocation->quantity,
                'source' => $source,
                'client_uuid' => $clientUuid,
                'redeemed_at' => $redeemedAt,
                'synced_at' => Carbon::now(),
            ]);
        });
    }

    private function resolveVoucher(string $credential): ?Voucher
    {
        $payload = $this->voucherToken->verify($credential);

        if ($payload !== null) {
            return Voucher::query()->with('allocation')->where('allocation_id', $payload['aid'])->first();
        }

        return Voucher::query()->with('allocation')->where('sms_code', $credential)->first();
    }

    private function expire(Allocation $allocation): void
    {
        DB::transaction(function () use ($allocation): void {
            $inventory = Inventory::query()
                ->where('location_id', $allocation->location_id)
                ->where('commodity_id', $allocation->commodity_id)
                ->lockForUpdate()
                ->first();

            if ($inventory !== null) {
                $inventory->quantity_locked = max(0.0, (float) $inventory->quantity_locked - (float) $allocation->quantity);
                $inventory->quantity_available = (float) $inventory->quantity_available + (float) $allocation->quantity;
                $inventory->save();
            }

            $allocation->status = AllocationStatus::Expired;
            $allocation->save();
        });
    }
}
